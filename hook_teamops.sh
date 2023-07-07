#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables/src/ops/teams
git pull

cd ~/cables/cables_api
npm run opdocs
