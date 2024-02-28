#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd shared
git pull
nvm install
nvm use
npm install
cd ..

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
