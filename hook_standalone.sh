#!/bin/bash -l

set -e
set -o pipefail

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
nvm install
nvm use
npm install
npm run build
echo "PACKAGING cables_electron"
npm run dist
cd ..

echo "DONE"
