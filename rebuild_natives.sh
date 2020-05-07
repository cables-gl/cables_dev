#!/bin/bash

set -e
set -o pipefail

echo "LOADING NODEJS VERSION" `cat .nvmrc`
. ~/.nvm/nvm.sh
nvm use

cd cables
echo "REBUILDING CORE"
npm rebuild node-sass
npm rebuild bcrypt --update-binary
cd ..
cd cables_api
echo "REBUILDING API"
npm rebuild node-sass
npm rebuild bcrypt --update-binary
cd ..
cd cables_ui
echo "REBUILDING UI"
npm rebuild node-sass
npm rebuild bcrypt --update-binary
