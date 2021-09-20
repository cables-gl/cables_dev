#!/bin/bash -l 

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_api
git checkout package-lock.json
git pull
nvm install
nvm use
npm install
gulp build
pm2 restart all
