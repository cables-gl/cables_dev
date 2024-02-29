#!/bin/bash -l

set -e
set -o pipefail

echo $SETUP_NODE_NVM_NVM
. ~/mynvm/nvm.sh

echo $CSC_LINK
echo "---"
echo $CSC_KEY_PASSWORD

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
npm run build
echo "PACKAGING cables_electron"
npm run dist
cd ..

echo "DONE"
