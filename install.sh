#!/bin/bash

ls ~/.nvm/nvm.sh > /dev/null 2>&1

if [ "$?" -eq "0" ]
then
	echo "NO nvm, ASSUMING LINUX...IS SCRIPT STOPS HERE UNCOMMENT NEXT LINE"
    sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm
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

npm install
git clone git@github.com:pandrr/cables.git
git clone git@github.com:undev-studio/cables_api.git
git clone git@github.com:undev-studio/cables_ui.git
touch cables_ui/scss/svgicons.scss
mkdir -p cables_api/public/gen/
touch cables_api/public/gen/opdocs.json
./rebuild_natives.sh
./update_all.sh develop
cp cables_api/cables_example.json cables_api/cables.json
