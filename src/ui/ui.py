from functools import cached_property
from os import sep
from os.path import join
from sys import path as sys_path
from typing import List, Union

for deps_path in [
    join(sep, "usr", "share", "bunkerweb", *paths)
    for paths in (("deps", "python"), ("utils",))
]:
    if deps_path not in sys_path:
        sys_path.append(deps_path)

from yaml_base_settings import YamlBaseSettings, YamlSettingsConfigDict  # type: ignore (present in /usr/share/bunkerweb/utils/)


class UiConfig(YamlBaseSettings):
    LISTEN_ADDR: str = "0.0.0.0"
    LISTEN_PORT: str = "7000"
    CORE_ADDR: str = ""
    CORE_TOKEN: str = ""
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "changeme"
    LOG_LEVEL: str = "info"
    REVERSE_PROXY_IPS: Union[str, set] = {
        "192.168.0.0/16",
        "172.16.0.0/12",
        "10.0.0.0/8",
        "127.0.0.0/8",
    }

    # The reading order is:
    # 1. Environment variables
    # 2. YAML file
    # 3. .env file
    # 4. Default values
    model_config = YamlSettingsConfigDict(
        yaml_file=join(sep, "etc", "bunkerweb", "config.yaml"),
        env_file=join(sep, "etc", "bunkerweb", "ui.conf"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @cached_property
    def log_level(self) -> str:
        return self.LOG_LEVEL.upper()

    @cached_property
    def reverse_proxy_ips(self) -> str:
        if isinstance(self.REVERSE_PROXY_IPS, set):
            return " ".join(self.REVERSE_PROXY_IPS)
        return self.REVERSE_PROXY_IPS


if __name__ == "__main__":
    from os import _exit, environ
    from regex import match as regex_match

    UI_CONFIG = UiConfig("ui", **environ)

    if not regex_match(
        r"^(?=.*?\p{Lowercase_Letter})(?=.*?\p{Uppercase_Letter})(?=.*?\d)(?=.*?[ !\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$",
        UI_CONFIG.ADMIN_PASSWORD,
    ):
        _exit(1)
    elif not UI_CONFIG.LISTEN_PORT.isdigit() or not (
        1 <= int(UI_CONFIG.LISTEN_PORT) <= 65535
    ):
        _exit(2)

    data = {
        "HOST": UI_CONFIG.LISTEN_ADDR,
        "PORT": UI_CONFIG.LISTEN_PORT,
        "NUXT_CORE_ADDR": UI_CONFIG.CORE_ADDR,
        "NUXT_CORE_TOKEN": UI_CONFIG.CORE_TOKEN,
        "NUXT_ADMIN_USERNAME": UI_CONFIG.ADMIN_USERNAME,
        "NUXT_ADMIN_PASSWORD": UI_CONFIG.ADMIN_PASSWORD,
        "NUXT_LOG_LEVEL": UI_CONFIG.log_level,
        "NUXT_REVERSE_PROXY_IPS": UI_CONFIG.reverse_proxy_ips,
    }

    content = ""
    for k, v in data.items():
        content += f"{k}={v!r}\n"

    with open("/tmp/ui.tmp.env", "w", encoding="utf-8") as f:
        f.write(content)