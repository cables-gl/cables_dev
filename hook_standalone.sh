#!/bin/bash -l

set -e
set -o pipefail

if [ -z "$1" ]; then
  BUILD_OS=""
else
  BUILD_OS=":$1";
fi

if [ -z "$BUILD_VERSION" ]; then
  ARGS="-- "
else
  ARGS="-- -c.buildVersion=$BUILD_VERSION -c.executableName=$EXE_NAME -c.extraMetadata.version=$BUILD_VERSION";
fi

if [ -z "$NOTARIZE" ] || [ "$NOTARIZE" = "false" ]; then
  ARGS="${ARGS} -c.mac.notarize=false"
fi

if [ -n "$RELEASE_TYPE" ]; then
  ARGS="${ARGS} -c.publish.releaseType=$RELEASE_TYPE"
fi

if [ -z "$NODE_EXE" ]; then NODE_EXE="node"; fi
if [ -z "$NPM_EXE" ]; then NPM_EXE="npm"; fi

$NPM_EXE config set script-shell /bin/bash

NODE_DIR=$(dirname $(which $NPM_EXE))
export PATH="$NODE_DIR:$PATH"

export BUILD_OS=$BUILD_OS
export BUILD_VERSION=$BUILD_VERSION
export NOTARIZE=$NOTARIZE
export NODE_EXE=$NODE_EXE
export NODE_DIR=$NODE_DIR
export ARGS=$ARGS

echo "building with node version `$NODE_EXE --version`, args: $ARGS"

echo "INSTALLING cables_dev DEPENDENCIES"
$NPM_EXE install

echo "BUILDING shared"
cd shared
git pull
$NPM_EXE install
$NPM_EXE run build
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
$NPM_EXE run dist$BUILD_OS $ARGS
cd ..

echo "DONE"
