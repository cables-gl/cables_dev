#!/bin/bash -l 

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables
git pull
nvm install
nvm use
npm install
npm run build

cd ~/cables/cables_ui
nvm install
nvm use
npm run build
