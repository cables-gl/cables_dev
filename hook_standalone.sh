#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables
git pull
nvm use
npm install
npm run build

cd ~/cables/cables_ui
git pull
nvm use
npm install
npm run build

cd ~/cables/cables_electron
git pull
nvm use
npm install
npm run p
