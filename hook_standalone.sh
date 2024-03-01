#!/bin/bash -l

set -e
set -o pipefail

if [ -z "$SETUP_NODE_NVM_NVM" ]; then
  . ~/.nvm/nvm.sh
else
  . $SETUP_NODE_NVM_NVM
fi

echo "INSTALLING cables_dev DEPENDENCIES"
nvm use
npm install

echo "BUILDING shared"
cd shared
git pull
nvm install
nvm use
npm install
cd ..

echo "BUILDING cables"
cd cables
git pull
nvm install
nvm use
npm install
npm run build
cd ..

echo "BUILDING cables_ui"
cd cables_ui
git pull
nvm install
nvm use
npm install
npm run build
cd ..

echo "BUILDING cables_electron"
cd cables_electron
git pull
nvm install
nvm use
npm install
./node_modules/.bin/electron-rebuild
npm run build
echo "PACKAGING cables_electron"
npm run dist
cd ..

echo "DONE"
