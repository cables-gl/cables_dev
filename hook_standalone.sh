#!/bin/bash -l

set -e
set -o pipefail

if [ -z "$1" ]; then
  BUILD_OS=""
else
  BUILD_OS=":$1";
fi

if [ -z "$NODE_EXE" ]; then NODE_EXE="node"; fi
if [ -z "$NPM_EXE" ]; then NPM_EXE="npm"; fi

NODE_DIR=$(dirname $(which $NPM_EXE))
export PATH="$NODE_DIR:$PATH"

echo "building with node version `$NODE_EXE --version`"

echo "INSTALLING cables_dev DEPENDENCIES"
$NPM_EXE install

echo "BUILDING shared"
cd shared
git pull
$NPM_EXE install
cd ..

echo "BUILDING cables"
cd cables
git pull
$NPM_EXE install
$NPM_EXE run build
cd ..

echo "BUILDING cables_ui"
cd cables_ui
git pull
$NPM_EXE install
$NPM_EXE run build
cd ..

echo "BUILDING cables_electron"
cd cables_electron
git pull
$NPM_EXE install
$NPM_EXE run build
echo "PACKAGING cables_electron"
$NPM_EXE run dist$BUILD_OS
cd ..

echo "DONE"
