#!/bin/bash -l

set -e
set -o pipefail

. ~/.nvm/nvm.sh

cd ~/cables/cables_api
npm run quotas:daily
