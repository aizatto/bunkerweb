import json
import base64

from pages.configs2 import configs_builder


configs = [
    {
        "filename": "my-config-1",
        "type": "http",
        "is_global": "no",
        "services": ["service1"],
    },
    {
        "filename": "my-config-1",
        "type": "http",
        "is_global": "yes",
        "services": ["service1", "service2"],
    },
    {
        "filename": "my-config-2",
        "type": "https",
        "is_global": "no",
        "services": ["service2"],
    },
]

config_types = ["http", "https", "socks4", "socks5"]

builder = configs_builder(configs, config_types)
print("builder", builder)
with open("configs2.json", "w") as f:
    json.dump(builder, f, indent=4)

output_base64_bytes = base64.b64encode(bytes(json.dumps(builder), "utf-8"))

output_base64_string = output_base64_bytes.decode("ascii")

with open("configs2.txt", "w") as f:
    f.write(output_base64_string)
