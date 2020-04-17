#!/bin/bash

set -e
set -o pipefail

echo "LOADING NODEJS VERSION" `cat .nvmrc`
. ~/.nvm/nvm.sh
nvm use
echo "UPDATING CORE..."
cd cables
git pull
git merge origin/develop
npm i
cd ..
echo "UPDATING API..."
cd cables_api
npm i
git pull
git merge origin/develop
cd ..
echo "UPDATING UI..."
cd cables_ui
git pull
git merge origin/develop
npm i
cd ..
echo "DONE"
