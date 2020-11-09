#!/bin/bash -l 

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_ui
git pull
nvm install
npm install
gulp build
