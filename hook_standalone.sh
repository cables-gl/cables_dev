#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd cables
git pull
nvm install
nvm use
npm install
npm run build
cd ..

cd cables_ui
git pull
nvm install
nvm use
npm install
npm run build
cd ..

cd cables_electron
git pull
nvm install
nvm use
npm install
npm run build
npm run dist
cd ..
