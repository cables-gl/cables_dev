#!/bin/bash -l
# 
# updates all repositories and merge develop
#

git pull
ls ~/.nvm/nvm.sh > /dev/null 2>&1

if [ $? -eq 0 ]
then
	echo "LOADING NODEJS VERSION" `cat .nvmrc`
	. ~/.nvm/nvm.sh
	nvm install `cat .nvmrc`
	nvm use `cat .nvmrc`
	nvm use
	nvm alias default `cat .nvmrc`
else
	echo "NVM NOT FOUND, RUNNING NODEJS WITH VERSION" `node --version` ", WANTED" `cat .nvmrc`;
fi

set -e
set -o pipefail

echo "UPDATING CORE..."
cd cables
if [ -n "${1}" ] && [ "clean" != "${1}" ]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git pull origin "$branch" || true
# merge current remote develop if branch is not master
if [ "master" != "${branch}" ]; then
    echo "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
else
    echo "WARNING: not merging origin/develop into master!"
fi
if [ "clean" == "${1}" ]; then
	rm -rf node_modules/
fi
npm i
cd ..

echo "UPDATING API..."
cd cables_api
if [ -n "${1}" ] && [ "clean" != "${1}" ]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git pull origin "$branch" || true
# merge current remote develop if branch is not master
if [ "master" != "${branch}" ]; then
    echo "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
else
    echo "WARNING: not merging origin/develop into master!"
fi
if [ "clean" == "${1}" ]; then
	rm -rf node_modules/
fi
npm i
cd ..

echo "UPDATING UI..."
cd cables_ui
if [ -n "${1}" ] && [ "clean" != "${1}" ]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git pull origin "${branch}" || true
# merge current remote develop if branch is not master
if [ "master" != "${branch}" ]; then
    echo "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
else
    echo "WARNING: not merging origin/develop into master!"
fi
if [ "clean" == "${1}" ]; then
	rm -rf node_modules/
fi
npm i
cd ..
echo "DONE"
