#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_ui
git pull
nvm install
nvm use
npm install --no-save
npm run build
