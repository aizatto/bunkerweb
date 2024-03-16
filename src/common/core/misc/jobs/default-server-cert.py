#!/usr/bin/env python3

from os import getenv, sep
from os.path import join
from pathlib import Path
from subprocess import DEVNULL, run
from sys import exit as sys_exit, path as sys_path
from traceback import format_exc

for deps_path in [join(sep, "usr", "share", "bunkerweb", *paths) for paths in (("deps", "python"), ("utils",), ("db",))]:
    if deps_path not in sys_path:
        sys_path.append(deps_path)

from logger import setup_logger  # type: ignore
from jobs import Job  # type: ignore

LOGGER = setup_logger("DEFAULT-SERVER-CERT", getenv("LOG_LEVEL", "INFO"))
LOGGER_OPENSSL = setup_logger("DEFAULT-SERVER-CERT.openssl", getenv("LOG_LEVEL", "INFO"))
status = 0

try:
    JOB = Job(LOGGER)

    cert_path = Path(sep, "var", "cache", "bunkerweb", "misc")
    if not JOB.is_cached_file("default-server-cert.pem", "month") or not JOB.is_cached_file("default-server-cert.key", "month"):
        LOGGER.info("Generating self-signed certificate for default server")
        cert_path.mkdir(parents=True, exist_ok=True)

        if (
            run(
                [
                    "openssl",
                    "req",
                    "-nodes",
                    "-x509",
                    "-newkey",
                    "ec",
                    "-pkeyopt",
                    "ec_paramgen_curve:prime256v1",
                    "-keyout",
                    str(cert_path.joinpath("default-server-cert.key")),
                    "-out",
                    str(cert_path.joinpath("default-server-cert.pem")),
                    "-days",
                    "3650",
                    "-subj",
                    "/C=AU/ST=Some-State/O=Internet Widgits Pty Ltd/CN=www.example.org/",
                ],
                stdin=DEVNULL,
                stderr=DEVNULL,
                check=False,
            ).returncode
            != 0
        ):
            LOGGER.error("Self-signed certificate generation failed for default server")
            status = 2
        else:
            LOGGER.info("Successfully generated self-signed certificate for default server")
            status = 1

        cached, err = JOB.cache_file("default-server-cert.pem", cert_path.joinpath("default-server-cert.pem"), overwrite_file=False)
        if not cached:
            LOGGER.error(f"Error while saving default-server-cert default-server-cert.pem file to db cache : {err}")
        else:
            LOGGER.info("Successfully saved default-server-cert default-server-cert.pem file to db cache")

        cached, err = JOB.cache_file("default-server-cert.key", cert_path.joinpath("default-server-cert.key"), overwrite_file=False)
        if not cached:
            LOGGER.error(f"Error while saving default-server-cert default-server-cert.key file to db cache : {err}")
        else:
            LOGGER.info("Successfully saved default-server-cert default-server-cert.key file to db cache")
    else:
        LOGGER.info("Skipping generation of self-signed certificate for default server (already present)")
except:
    status = 2
    LOGGER.error(f"Exception while running default-server-cert.py :\n{format_exc()}")

sys_exit(status)
