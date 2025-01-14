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

if [ "prerelease" = "$RELEASE_TYPE" ]; then
  export EP_PRE_RELEASE=true
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
export USE_HARD_LINKS=false

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
echo "INSTALLING standalone op-modules"
cd dist/ops/extensions/Ops.Extension.Standalone/
cd Ops.Extension.Standalone.Ffmpeg/
$NPM_EXE install --prefix ./ fluent-ffmpeg --no-save
cd ..
cd  Ops.Extension.Standalone.Net.Osc/
$NPM_EXE install --prefix ./ osc --no-save
cd ..
cd  Ops.Extension.Standalone.Net.Osc_v2/
$NPM_EXE install --prefix ./ osc --no-save
cd ..
cd Ops.Extension.Standalone.Net.OscSend/
$NPM_EXE install --prefix ./ osc --no-save
cd ..
echo "PACKAGING cables_electron"
$NPM_EXE run dist$BUILD_OS $ARGS
cd ..

echo "DONE"
