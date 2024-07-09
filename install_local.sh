#!/bin/bash

COMMUNITY_BUILD=false
if [[ "$*" == *"--community"* ]]
then
    COMMUNITY_BUILD=true
fi

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
      if [ "$COMMUNITY_BUILD" = "true" ]; then
        echo "TRYING TO INSTALL DEPENDENCIES..."
        sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm
      fi
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

. .env
CABLES_DEV_REPO="${CABLES_DEV_REPO:=git@github.com:cables-gl/cables_dev.git}"
CABLES_CORE_REPO="${CABLES_CORE_REPO:=git@github.com:cables-gl/cables.git}"
CABLES_API_REPO="${CABLES_API_REPO:=git@github.com:undev-studio/cables_api.git}"
CABLES_UI_REPO="${CABLES_UI_REPO:=git@github.com:cables-gl/cables_ui.git}"
CABLES_ELECTRON_REPO="${CABLES_ELECTRON_REPO:=git@github.com:cables-gl/cables_electron.git}"
CABLES_ASSET_LIBRARY_REPO="${CABLES_ASSET_LIBRARY_REPO:=git@github.com:cables-gl/cables-asset-library.git}"

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
cd ..

echo "INSTALLING CORE..."
if [ ! -d "cables/" ]; then
  git clone ${CABLES_CORE_REPO}
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

if [ "$COMMUNITY_BUILD" = "true" ]; then
  echo "INSTALLING API..."
  if [ ! -d "cables_api/" ]; then
    git clone ${CABLES_API_REPO}
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

  echo "INSTALLING DEFAULT ASSETS...";
  if [ "$CLEAN" = "true" ]; then
    echo "  ...deleting default assets";
    rm -rf cables_api/public/assets/library
    git clone ${CABLES_ASSET_LIBRARY_REPO} cables_api/public/assets/library
  fi
  mkdir -p cables_api/public/assets/library
  if [ -d "cables_api/public/assets/library/.git" ]; then
    git -C cables_api/public/assets/library pull
  else
    git clone ${CABLES_ASSET_LIBRARY_REPO} cables_api/public/assets/library
  fi
fi

echo "INSTALLING UI..."
if [ ! -d "cables_ui/" ]; then
  git clone ${CABLES_UI_REPO}
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
  git clone ${CABLES_ELECTRON_REPO}
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

echo "BUILDING EVERYTHING..."
cd shared/
npm run build
cd ..
cd cables/
npm run build
cd ..
if [ "$COMMUNITY_BUILD" = "true" ]; then
  cd cables_api/
  npm run build
  cd ..
fi
cd cables_ui/
npm run build
cd ..
cd cables_electron/
npm run build
cd ..

NPM_START_CMD="`npm run start:standalone`"
if [ "$COMMUNITY_BUILD" = "true" ]; then
  NPM_START_CMD="`npm run start`"
fi
echo ""
echo -n "BEFORE YOU RUN ${NPM_START_CMD} MAKE SURE YOUR NODE VERSION MATCHES "
cat .nvmrc
echo " BY RUNNING 'node --version'"
