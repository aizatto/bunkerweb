#!/usr/bin/env python3

from sys import path, argv, exit
from glob import glob
from os import getcwd, getenv, _exit
from os.path import isfile
from traceback import format_exc
from json import loads
from subprocess import run

path.append(f"{getcwd()}/utils")
path.append(f"{getcwd()}/tests")

from Test import Test
from DockerTest import DockerTest
from AutoconfTest import AutoconfTest
from SwarmTest import SwarmTest
from KubernetesTest import KubernetesTest
from LinuxTest import LinuxTest
from logger import setup_logger

logger = setup_logger("Tests", getenv("LOG_LEVEL", "INFO"))

if len(argv) <= 1:
    logger.error("Missing type argument")
    exit(1)

test_type = argv[1]
if not test_type in ["linux", "docker", "autoconf", "swarm", "kubernetes", "ansible"]:
    logger.error(f"Wrong type argument {test_type}")
    exit(1)

run("docker system prune", shell=True)

logger.info(f"Starting tests for {test_type} ...")
ret = False
end_fun = None
if test_type == "docker":
    ret = DockerTest.init()
    end_fun = DockerTest.end
elif test_type == "autoconf":
    ret = AutoconfTest.init()
    end_fun = AutoconfTest.end
elif test_type == "swarm":
    ret = SwarmTest.init()
    end_fun = SwarmTest.end
elif test_type == "kubernetes":
    ret = KubernetesTest.init()
    end_fun = KubernetesTest.end
elif test_type == "linux":
    distro = argv[2]
    ret = LinuxTest.init(distro)
    end_fun = LinuxTest.end
if not ret:
    logger.error("Test.init() failed")
    exit(1)

for example in glob("./examples/*"):
    if isfile(f"{example}/tests.json"):
        try:
            with open(f"{example}/tests.json") as f:
                tests = loads(f.read())
            if not test_type in tests["kinds"]:
                logger.info(
                    f"Skipping tests for {tests['name']} (not in kinds)",
                )
                continue
            test_obj = None
            no_copy_container = False
            delay = 0
            if "no_copy_container" in tests:
                no_copy_container = tests["no_copy_container"]
            if "delay" in tests:
                delay = tests["delay"]
            if test_type == "docker":
                test_obj = DockerTest(
                    tests["name"],
                    tests["timeout"],
                    tests["tests"],
                    no_copy_container=no_copy_container,
                    delay=delay,
                )
            elif test_type == "autoconf":
                test_obj = AutoconfTest(
                    tests["name"],
                    tests["timeout"],
                    tests["tests"],
                    no_copy_container=no_copy_container,
                    delay=delay,
                )
            elif test_type == "swarm":
                test_obj = SwarmTest(
                    tests["name"], tests["timeout"], tests["tests"], delay=delay
                )
            elif test_type == "kubernetes":
                test_obj = KubernetesTest(
                    tests["name"], tests["timeout"], tests["tests"], delay=delay
                )
            elif test_type == "linux":
                test_obj = LinuxTest(
                    tests["name"], tests["timeout"], tests["tests"], distro
                )
            if not test_obj.run_tests():
                logger.error(f"Tests failed for {tests['name']}")
                if test_type == "linux":
                    ret = end_fun(distro)
                else:
                    ret = end_fun()
                _exit(1)
        except:
            logger.error(
                f"Exception while executing test for example {example} :\n{format_exc()}",
            )
            if test_type == "linux":
                ret = end_fun(distro)
            else:
                ret = end_fun()
            exit(1)

if test_type == "linux":
    ret = end_fun(distro)
else:
    ret = end_fun()
if not ret:
    logger.error("Test.end() failed")
    exit(1)

logger.info(f"All tests finished for {test_type} !")

run("docker system prune", shell=True)
