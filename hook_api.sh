#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_api
git pull
nvm install
nvm use
npm install --no-save --omit=optional
npm run build
pm2 restart server_sandbox
pm2 restart server_api
