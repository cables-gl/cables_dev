#!/bin/bash -l
#
# build all repositories
#

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

COMMUNITY_BUILD=false
cables_standalone="true";
if [[ "$*" == *"--community"* ]]
then
    COMMUNITY_BUILD=true
    cables_standalone="false";
fi

ls ~/.nvm/nvm.sh > /dev/null 2>&1

if [ $? -eq 0 ]
then
	echo -e "LOADING NODEJS VERSION" `cat .nvmrc`
	. ~/.nvm/nvm.sh
	nvm install `cat .nvmrc`
	nvm use `cat .nvmrc`
	nvm use
	nvm alias --no-colors default `cat .nvmrc`
else
	echo -e "NVM NOT FOUND, RUNNING NODEJS WITH VERSION" `node --version` ", WANTED" `cat .nvmrc`;
fi

echo -e ""
echo -e "${GREEN}BUILDING SHARED...${NC}"
cd shared
npm run build
cd ..

echo -e ""
echo -e "${GREEN}BUILDING CORE...${NC}"
cd cables
npm run build
cd ..
exit

echo -e ""
echo -e "${GREEN}BUILDING UI...${NC}"
cd cables_ui
npm run build
cd ..

if [ -d cables_electron ]; then
  echo -e ""
  echo -e "${GREEN}BUILDING ELECTRON...${NC}"
  cd cables_electron
  npm run build
  cd ..
fi

if [ -d cables_api ]; then
  if [ -f cables_api/package.json ]; then
    echo -e ""
    echo -e "${GREEN}BUILDING API...${NC}"
    cd cables_api
    npm run build
    cd ..
  fi
fi

cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}DONE${NC}"


