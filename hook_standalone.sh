#!/bin/bash -l

set -e
set -o pipefail

if [ -z "$1" ]; then
  BUILD_OS=""
else
  BUILD_OS=":$1";
fi

echo "building with node version `node --version`"

echo "INSTALLING cables_dev DEPENDENCIES"
#nvm install
#nvm use
npm install

echo "BUILDING shared"
cd shared
git pull
#nvm install
#nvm use
npm install
cd ..

echo "BUILDING cables"
cd cables
git pull
#nvm install
#nvm use
npm install
npm run build
cd ..

echo "BUILDING cables_ui"
cd cables_ui
git pull
#nvm install
#nvm use
npm install
npm run build
cd ..

echo "BUILDING cables_electron"
cd cables_electron
git pull
#nvm install
#nvm use
npm install
./node_modules/.bin/electron-rebuild
npm run build
echo "PACKAGING cables_electron"
npm run dist$BUILD_OS
cd ..

echo "DONE"
