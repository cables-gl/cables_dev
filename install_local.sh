#!/bin/bash

CLEAN=false
if [ "$1" = "clean" ]; then
	echo "Attempting a clean install, this will delete stuff, please confirm by pressing any key..."
	while [ true ] ; do
		read -t 3 -n 1
		if [ $? = 0 ] ; then
			CLEAN=true;
			break
		fi
	done
fi

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
	nvm alias default `cat .nvmrc`
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

echo "INSTALLING CORE..."
npm install
if [ -d "cables/" ]; then
	cd cables/
	if [ "$CLEAN" = "true" ]; then
		echo "  ...deleting node modules";
		rm -rf node_modules/
	fi
	git pull
	cd ..
else
	git clone git@github.com:pandrr/cables.git
fi

echo "INSTALLING API..."
if [ -d "cables_api/" ]; then
	cd cables_api/
	if [ "$CLEAN" = "true" ]; then
		echo "  ...deleting node modules";
		rm -rf node_modules/
	fi
	git pull
	cd ..
else
	git clone git@github.com:undev-studio/cables_api.git
fi

echo "INSTALLING UI..."
if [ -d "cables_ui/" ]; then
	cd cables_ui/
	if [ "$CLEAN" = "true" ]; then
		echo "  ...deleting node modules";
		rm -rf node_modules/
	fi
	git pull
	git checkout develop
	cd ..
else
	git clone git@github.com:undev-studio/cables_ui.git
fi

touch cables_ui/scss/svgicons.scss
mkdir -p cables_api/public/gen/
touch cables_api/public/gen/opdocs.json
./update_all.sh
if [ ! -f /cables_api/cables.json ]; then
    cp cables_api/cables_example.json cables_api/cables.json
fi
