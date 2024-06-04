#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables
git pull
nvm install
nvm use
npm ci
npm run build

cd ~/cables/cables_ui
npm ci
nvm use
npm run build

cd ~/cables/cables_api
npm run opdocs


