#!/bin/bash -l
# update all repos to master / mostly used for release on live server

git pull
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

# set master branch
branch="master"
echo "UPDATING SHARED..."
cd shared

# ignore errors here, since branch might not be on remote
git checkout master
git pull
nvm install
nvm use
npm install
npm run build
cd ..

echo "UPDATING CORE..."
cd cables

# ignore errors here, since branch might not be on remote
git checkout master
git pull
nvm install
nvm use
npm install
npm run build
cd ..

echo "UPDATING API..."
cd cables_api
git checkout master
git pull
nvm install
nvm use
npm install
npm run build
cd ..

echo "UPDATING UI..."
cd cables_ui
git checkout master
git pull
nvm install
nvm use
npm install
npm run build:live
cd ..
echo "DONE"
