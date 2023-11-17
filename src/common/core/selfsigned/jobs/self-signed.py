#!/usr/bin/python3
# -*- coding: utf-8 -*-

from datetime import timedelta
from os import getenv, sep
from os.path import join
from pathlib import Path
from subprocess import DEVNULL, STDOUT, run
from sys import exit as sys_exit, path as sys_path
from traceback import format_exc
from typing import Tuple

for deps_path in [
    join(sep, "usr", "share", "bunkerweb", *paths)
    for paths in (
        ("deps", "python"),
        ("api",),
        ("utils",),
    )
]:
    if deps_path not in sys_path:
        sys_path.append(deps_path)

from cryptography import x509
from cryptography.hazmat.backends import default_backend

from API import API  # type: ignore
from logger import setup_logger  # type: ignore
from jobs import cache_file, get_cache

LOGGER = setup_logger("self-signed", getenv("LOG_LEVEL", "INFO"))
CORE_API = API(getenv("API_ADDR", ""), "job-self-signed")
CORE_TOKEN = getenv("CORE_TOKEN", None)
status = 0


def generate_cert(
    first_server: str,
    days: str,
    subj: str,
    self_signed_path: Path,
    *,
    multisite: bool = False,
) -> Tuple[bool, int]:
    if self_signed_path.joinpath(f"{first_server}.pem").is_file():
        if (
            run(
                [
                    "openssl",
                    "x509",
                    "-checkend",
                    "86400",
                    "-noout",
                    "-in",
                    str(self_signed_path.joinpath(f"{first_server}.pem")),
                ],
                stdin=DEVNULL,
                stderr=STDOUT,
                check=False,
            ).returncode
            == 0
        ):
            LOGGER.info(f"Self-signed certificate already present for {first_server}")

            certificate = x509.load_pem_x509_certificate(
                self_signed_path.joinpath(f"{first_server}.pem").read_bytes(),
                default_backend(),
            )
            if sorted(attribute.rfc4514_string() for attribute in certificate.subject) != sorted(v for v in subj.split("/") if v):
                LOGGER.warning(f"Subject of self-signed certificate for {first_server} is different from the one in the configuration, regenerating ...")
            elif certificate.not_valid_after - certificate.not_valid_before != timedelta(days=int(days)):
                LOGGER.warning(f"Expiration date of self-signed certificate for {first_server} is different from the one in the configuration, regenerating ...")
            else:
                return True, 0

    LOGGER.info(f"Generating self-signed certificate for {first_server}")
    if (
        run(
            [
                "openssl",
                "req",
                "-nodes",
                "-x509",
                "-newkey",
                "rsa:4096",
                "-keyout",
                str(self_signed_path.joinpath(f"{first_server}.key")),
                "-out",
                str(self_signed_path.joinpath(f"{first_server}.pem")),
                "-days",
                days,
                "-subj",
                subj,
            ],
            stdin=DEVNULL,
            stderr=DEVNULL,
            check=False,
        ).returncode
        != 0
    ):
        LOGGER.error(f"Self-signed certificate generation failed for {first_server}")
        return False, 2

    # Update db
    cached, err = cache_file(
        f"{first_server}.pem",
        self_signed_path.joinpath(f"{first_server}.pem").read_bytes(),
        CORE_API,
        CORE_TOKEN,
        service_id=first_server if multisite else None,
    )
    if not cached:
        LOGGER.error(f"Error while caching self-signed {first_server}.pem file : {err}")

    cached, err = cache_file(
        f"{first_server}.key",
        self_signed_path.joinpath(f"{first_server}.key").read_bytes(),
        CORE_API,
        CORE_TOKEN,
        service_id=first_server if multisite else None,
    )
    if not cached:
        LOGGER.error(f"Error while caching self-signed {first_server}.key file : {err}")

    LOGGER.info(f"Successfully generated self-signed certificate for {first_server}")
    return True, 1


status = 0

try:
    self_signed_path = Path(sep, "var", "cache", "bunkerweb", "selfsigned")

    # Multisite case
    if getenv("MULTISITE") == "yes":
        servers = getenv("SERVER_NAME") or []

        if isinstance(servers, str):
            servers = servers.split()

        for first_server in servers:
            if (
                not first_server
                or getenv(
                    f"{first_server}_GENERATE_SELF_SIGNED_SSL",
                    getenv("GENERATE_SELF_SIGNED_SSL", "no"),
                )
                != "yes"
            ):
                continue

            self_signed_path.mkdir(parents=True, exist_ok=True)

            if not self_signed_path.joinpath(f"{first_server}.pem").is_file():
                cached_pem = get_cache(f"{first_server}.pem", CORE_API, CORE_TOKEN, service_id=first_server)

                if cached_pem:
                    self_signed_path.joinpath(f"{first_server}.pem").write_bytes(cached_pem["data"])

            if not self_signed_path.joinpath(f"{first_server}.key").is_file():
                cached_key = get_cache(f"{first_server}.key", CORE_API, CORE_TOKEN, service_id=first_server)

                if cached_key:
                    self_signed_path.joinpath(f"{first_server}.key").write_bytes(cached_key["data"])

            ret, ret_status = generate_cert(
                first_server,
                getenv(
                    f"{first_server}_SELF_SIGNED_SSL_EXPIRY",
                    getenv("SELF_SIGNED_SSL_EXPIRY", "365"),
                ),
                getenv(
                    f"{first_server}_SELF_SIGNED_SSL_SUBJ",
                    getenv("SELF_SIGNED_SSL_SUBJ", "/CN=www.example.com/"),
                ),
                self_signed_path,
                multisite=True,
            )
            status = ret_status

    # Singlesite case
    elif getenv("GENERATE_SELF_SIGNED_SSL", "no") == "yes" and getenv("SERVER_NAME"):
        first_server = getenv("SERVER_NAME", "").split()[0]

        self_signed_path.mkdir(parents=True, exist_ok=True)

        if not self_signed_path.joinpath(f"{first_server}.pem").is_file():
            cached_pem = get_cache(f"{first_server}.pem", CORE_API, CORE_TOKEN)

            if cached_pem:
                self_signed_path.joinpath(f"{first_server}.pem").write_bytes(cached_pem["data"])

        if not self_signed_path.joinpath(f"{first_server}.key").is_file():
            cached_key = get_cache(f"{first_server}.key", CORE_API, CORE_TOKEN)

            if cached_key:
                self_signed_path.joinpath(f"{first_server}.key").write_bytes(cached_key["data"])

        ret, ret_status = generate_cert(
            first_server,
            getenv("SELF_SIGNED_SSL_EXPIRY", "365"),
            getenv("SELF_SIGNED_SSL_SUBJ", "/CN=www.example.com/"),
            self_signed_path,
        )
        status = ret_status
except:
    status = 2
    LOGGER.error(f"Exception while running self-signed.py :\n{format_exc()}")

sys_exit(status)
