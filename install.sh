#!/bin/bash

ls ~/.nvm/nvm.sh > /dev/null 2>&1

if [ "$?" -eq "0" ]; then
    echo "nvm FOUND...";	
    if [[ `uname` == "Darwin" ]]; then
	echo "DETECTED OSX...";
    else
	echo "ASSUMING LINUX..."
	echo "TRYING TO INSTALL DEPENDENCIES..."
    	sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm
    fi
    echo "LOADING nodejs VERSION" `cat .nvmrc`
    . ~/.nvm/nvm.sh
    nvm install `cat .nvmrc`
    nvm use `cat .nvmrc`
    nvm use
else
    node --version > /dev/null 2>&1
    if [ "$?" -eq "0" ]; then
    	echo "nvm NOT FOUND, RUNNING FOUND nodejs WITH VERSION" `node --version` ", WANTED" `cat .nvmrc`;
    else
    	echo "nvm NOT FOUND, nodejs NOT FOUND, PLEASE INSTALL VERSION" `cat .nvmrc`;
	exit 1
    fi
fi

set -e
set -o pipefail

npm install
if [ -d "cables/" ]; then
	cd cables/
	git pull
	cd ..
else
	git clone git@github.com:pandrr/cables.git
fi

if [ -d "cables_api/" ]; then
	cd cables_api/
	git pull
	cd ..
else
	git clone git@github.com:undev-studio/cables_api.git
fi

if [ -d "cables_ui/" ]; then
	cd cables_ui/
	git pull
	cd ..
else
	git clone git@github.com:undev-studio/cables_ui.git
fi

touch cables_ui/scss/svgicons.scss
mkdir -p cables_api/public/gen/
touch cables_api/public/gen/opdocs.json
./rebuild_natives.sh
./update_all.sh develop
cp cables_api/cables_example.json cables_api/cables.json
