#!/bin/bash

if [ $# -ne 1 ] ; then
    echo "Missing version argument"
    exit 1
fi

OLD_VERSION="$(tr -d '\n' < src/VERSION | sed 's/\./\\./g' | sed 's/\-/\\-/g')"
NEW_VERSION="$(echo -n "$1" | sed 's/\./\\./g' | sed 's/\-/\\-/g')"

# VERSION
echo -en "$NEW_VERSION" | sed 's/\\//g' | tee src/VERSION
# integrations
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" misc/integrations/*.yml
# examples
shopt -s globstar
for example in examples/* ; do
    if [ -d "$test" ] ; then
        sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" "$example/*.yml"
    fi
done
shopt -u globstar
# docs
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" docs/*.md
# README
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" README.md
# tests
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" tests/ui/docker-compose.yml
shopt -s globstar
for test in tests/core/* ; do
    if [ -d "$test" ] ; then
        sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" "$test/docker-compose.yml"
    fi
done
shopt -u globstar
# linux
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" src/linux/scripts/*.sh
# db
sed -i "s@${OLD_VERSION}@${NEW_VERSION}@g" src/common/db/model.py