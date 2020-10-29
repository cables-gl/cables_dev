#!/bin/bash

ls ~/.nvm/nvm.sh > /dev/null 2>&1

if [ $? -eq 0 ]
then
	echo "LOADING NODEJS VERSION" `cat .nvmrc`
	. ~/.nvm/nvm.sh
	nvm install `cat .nvmrc`
	nvm use `cat .nvmrc`
	nvm use
else
	echo "NVM NOT FOUND, RUNNING NODEJS WITH VERSION" `node --version` ", WANTED" `cat .nvmrc`;
fi

set -e
set -o pipefail

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
