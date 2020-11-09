#!/bin/bash -l 

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_api
git pull
nvm install
npm install
gulp build
pm2 restart all
