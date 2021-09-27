#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_ui
git pull
nvm install
nvm use
npm install
if [ -n "${1}" ] && [ "live" = "${1}" ]; then
	npm run build:live
else
  npm run build
fi
