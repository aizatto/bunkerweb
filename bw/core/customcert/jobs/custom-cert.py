#!/usr/bin/python3

from os import getenv, makedirs
from os.path import isfile
from sys import exit as sys_exit, path as sys_path
from traceback import format_exc

sys_path.append("/opt/bunkerweb/deps/python")
sys_path.append("/opt/bunkerweb/utils")

from jobs import file_hash
from logger import setup_logger

logger = setup_logger("CUSTOM-CERT", getenv("LOG_LEVEL", "INFO"))


def check_cert(cert_path):
    try:
        cache_path = (
            "/opt/bunkerweb/cache/customcert/" + cert_path.replace("/", "_") + ".hash"
        )
        current_hash = file_hash(cert_path)
        if not isfile(cache_path):
            with open(cache_path, "w") as f:
                f.write(current_hash)
        old_hash = file_hash(cache_path)
        if old_hash == current_hash:
            return False
        with open(cache_path, "w") as f:
            f.write(current_hash)
        return True
    except:
        logger.error(
            f"Exception while running custom-cert.py (check_cert) :\n{format_exc()}",
        )
    return False


status = 0

try:

    makedirs("/opt/bunkerweb/cache/customcert/", exist_ok=True)

    # Multisite case
    if getenv("MULTISITE") == "yes":
        for first_server in getenv("SERVER_NAME").split(" "):
            if (
                getenv(first_server + "_USE_CUSTOM_HTTPS", getenv("USE_CUSTOM_HTTPS"))
                != "yes"
            ):
                continue
            if first_server == "":
                continue
            cert_path = getenv(first_server + "_CUSTOM_HTTPS_CERT")
            logger.info(
                f"Checking if certificate {cert_path} changed ...",
            )
            need_reload = check_cert(cert_path)
            if need_reload:
                logger.info(
                    f"Detected change for certificate {cert_path}",
                )
                status = 1
            else:
                logger.info(
                    "No change for certificate {cert_path}",
                )

    # Singlesite case
    elif getenv("USE_CUSTOM_HTTPS") == "yes" and getenv("SERVER_NAME") != "":
        cert_path = getenv("CUSTOM_HTTPS_CERT")
        logger.info(f"Checking if certificate {cert_path} changed ...")
        need_reload = check_cert(cert_path)
        if need_reload:
            logger.info(f"Detected change for certificate {cert_path}")
            status = 1
        else:
            logger.info(f"No change for certificate {cert_path}")

except:
    status = 2
    logger.error(f"Exception while running custom-cert.py :\n{format_exc()}")

sys_exit(status)
