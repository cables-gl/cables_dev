#!/bin/bash

CLEAN=false
if [ "$1" = "clean" ]; then
  echo "Attempting a clean install, this will delete stuff, please confirm by pressing any key or stop here with ctrl-c..."
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
    source ~/.nvm/nvm.sh
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
npm install --no-save
echo "INSTALLING SHARED..."
cd shared/
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
npm run build
cd ..

echo "INSTALLING CORE..."
if [ ! -d "cables/" ]; then
  git clone git@github.com:cables-gl/cables.git
fi
cd cables/
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo "INSTALLING API..."
if [ ! -d "cables_api/" ]; then
  git clone git@github.com:undev-studio/cables_api.git
fi
cd cables_api/
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo "INSTALLING UI..."
if [ ! -d "cables_ui/" ]; then
  git clone git@github.com:cables-gl/cables_ui.git
fi
cd cables_ui/
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo "INSTALLING ELECTRON..."
if [ ! -d "cables_electron/" ]; then
  	git clone git@github.com:cables-gl/cables_electron.git
fi
cd cables_electron/
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting node modules";
  rm -rf node_modules/
fi
git pull
git checkout develop
npm install --no-save
cd ..

echo "INSTALLING DEFAULT ASSETS...";
if [ "$CLEAN" = "true" ]; then
  echo "  ...deleting default assets";
  rm -rf cables_api/public/assets/library
  git clone git@github.com:cables-gl/cables-asset-library.git cables_api/public/assets/library
fi
mkdir -p cables_api/public/assets/library
if [ -d "cables_api/public/assets/library/.git" ]; then
  git -C cables_api/public/assets/library pull
else
  git clone git@github.com:cables-gl/cables-asset-library.git cables_api/public/assets/library
fi

echo ""
echo -n "BEFORE YOU RUN 'npm run start' MAKE SURE YOUR NODE VERSION MATCHES "
cat .nvmrc
echo " BY RUNNING 'node --version'"
