#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/shared
git checkout package-lock.json
git pull
nvm install
nvm use
npm install

cd ~/cables/cables_ui
git pull
nvm install
nvm use
npm install
npm run build

cd ~/cables/cables
git pull
nvm install
nvm use
npm install
npm run build

cd ~/cables/cables_api
git checkout package-lock.json
git pull
nvm install
nvm use
npm install
npm run build
pm2 restart server_sandbox
pm2 restart server_api
