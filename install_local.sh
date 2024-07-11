#!/bin/bash

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

CABLES_DEV_REPO="${CABLES_DEV_REPO:=git@github.com:cables-gl/cables_dev.git}"
CABLES_CORE_REPO="${CABLES_CORE_REPO:=git@github.com:cables-gl/cables.git}"
CABLES_API_REPO="${CABLES_API_REPO:=git@github.com:undev-studio/cables_api.git}"
CABLES_UI_REPO="${CABLES_UI_REPO:=git@github.com:cables-gl/cables_ui.git}"
CABLES_ELECTRON_REPO="${CABLES_ELECTRON_REPO:=git@github.com:cables-gl/cables_electron.git}"
CABLES_EXTENSION_OPS_REPO="${CABLES_EXTENSION_OPS_REPO:=git@github.com:cables-gl/cables_extensionops.git}"
CABLES_ASSET_LIBRARY_REPO="${CABLES_ASSET_LIBRARY_REPO:=git@github.com:cables-gl/cables-asset-library.git}"

COMMUNITY_BUILD=false
if [[ "$*" == *"--community"* ]]
then
    COMMUNITY_BUILD=true
fi

CLEAN=false
if [ "$1" = "clean" ]; then
  echo -e "{$RED}Attempting a clean install, this will delete stuff, please confirm by pressing any key or stop here with ctrl-c...${NC}"
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
    echo -e "nvm FOUND...";
    if [[ `uname` == "Darwin" ]]; then
	    echo -e "DETECTED OSX...";
    else
      echo -e "ASSUMING LINUX/WSL..."
      if [ "$COMMUNITY_BUILD" = "true" ]; then
        echo -e "TRYING TO INSTALL DEPENDENCIES..."
        sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm
      fi
    fi
    echo -e "LOADING nodejs VERSION" `cat .nvmrc`
    source ~/.nvm/nvm.sh
    nvm install `cat .nvmrc`
    nvm use `cat .nvmrc`
    nvm use
    nvm alias default `cat .nvmrc`
else
    node --version > /dev/null 2>&1
    if [ "$?" -eq "0" ]; then
    	echo -e "{$RED}nvm NOT FOUND, RUNNING FOUND nodejs WITH VERSION${NC}" `node --version` "{$RED} WANTED${NC}" `cat .nvmrc`;
    else
    	echo -e "{$RED}nvm NOT FOUND, nodejs NOT FOUND, PLEASE INSTALL VERSION${NC}" `cat .nvmrc`;
	exit 1
    fi
fi

set -e
set -o pipefail
npm install --no-save

echo -e ""
echo -e "${GREEN}INSTALLING SHARED...${NC}"
cd shared/
if [ "$CLEAN" = "true" ]; then
  echo -e "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo -e ""
echo -e "${GREEN}INSTALLING CORE...${NC}"
if [ ! -d "cables/" ]; then
  git clone ${CABLES_CORE_REPO}
fi
cd cables/
if [ "$CLEAN" = "true" ]; then
  echo -e "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo -e ""
echo -e "${GREEN}INSTALLING EXTENSION OPS...${NC}";
if [ "$CLEAN" = "true" ]; then
  echo -e "  ...deleting extension ops";
  rm -rf cables/src/ops/extensions
  git clone ${CABLES_EXTENSION_OPS_REPO} cables/src/ops/extensions
fi
mkdir -p cables/src/ops/extensions
if [ -d "cables/src/ops/extensions/.git" ]; then
  git -C cables/src/ops/extensions pull
else
  git clone ${CABLES_EXTENSION_OPS_REPO} cables/src/ops/extensions
fi

if [ "$COMMUNITY_BUILD" = "true" ]; then
  echo -e ""
  echo -e "${GREEN}INSTALLING API..${NC}"
  if [ ! -d "cables_api/" ]; then
    git clone ${CABLES_API_REPO}
  fi
  cd cables_api/
  if [ "$CLEAN" = "true" ]; then
    echo -e "  ...deleting node modules";
    rm -rf node_modules/
  fi
  git checkout develop
  git pull
  npm install --no-save
  cd ..

  echo -e ""
  echo -e "${GREEN}INSTALLING DEFAULT ASSETS...${NC}";
  if [ "$CLEAN" = "true" ]; then
    echo -e "  ...deleting default assets";
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

echo -e ""
echo -e "${GREEN}INSTALLING UI...${NC}"
if [ ! -d "cables_ui/" ]; then
  git clone ${CABLES_UI_REPO}
fi
cd cables_ui/
if [ "$CLEAN" = "true" ]; then
  echo -e "  ...deleting node modules";
  rm -rf node_modules/
fi
git checkout develop
git pull
npm install --no-save
cd ..

echo -e ""
echo -e "${GREEN}INSTALLING ELECTRON...${NC}"
if [ ! -d "cables_electron/" ]; then
  git clone ${CABLES_ELECTRON_REPO}
fi
cd cables_electron/
if [ "$CLEAN" = "true" ]; then
  echo -e "  ...deleting node modules";
  rm -rf node_modules/
fi
git pull
git checkout develop
npm install --no-save
cd ..

echo -e ""
echo -e "${GREEN}BUILDING SHARED...${NC}"
cd shared/
npm run build
cd ..
echo -e ""
echo -e "${GREEN}BUILDING CORE...${NC}"
cd cables/
npm run build
cd ..
if [ "$COMMUNITY_BUILD" = "true" ]; then
  echo -e ""
  echo -e "${GREEN}BUILDING API...${NC}"
  cd cables_api/
  npm run build
  cd ..
fi
echo -e ""
echo -e "${GREEN}BUILDING UI...${NC}"
cd cables_ui/
npm run build
cd ..
echo -e ""
echo -e "${GREEN}BUILDING ELECTRON...${NC}"
cd cables_electron/
npm run build
cd ..

NPM_START_CMD="'npm run start:standalone'"
if [ "$COMMUNITY_BUILD" = "true" ]; then
  NPM_START_CMD="'npm run start'"
fi
echo -e ""
echo -e "${YELLOW}BEFORE YOU RUN ${NPM_START_CMD} MAKE SURE YOUR NODE VERSION MATCHES" `cat .nvmrc` "BY RUNNING 'node --version'${NC}"
echo -e ""
