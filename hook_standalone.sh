#!/bin/bash -l

set -e
set -o pipefail

if [ -z "$1" ]; then
  BUILD_OS=""
else
  BUILD_OS=":$1";
fi

echo "building with node version `node --version`"
echo $PATH
which node
echo $NODE_EXE
echo $NPM_EXE
exit
echo "INSTALLING cables_dev DEPENDENCIES"
npm install

echo "BUILDING shared"
cd shared
git pull
npm install
cd ..

echo "BUILDING cables"
cd cables
git pull
npm install
npm run build
cd ..

echo "BUILDING cables_ui"
cd cables_ui
git pull
npm install
npm run build
cd ..

echo "BUILDING cables_electron"
cd cables_electron
git pull
npm install
npm run build
echo "PACKAGING cables_electron"
npm run dist$BUILD_OS
cd ..

echo "DONE"
