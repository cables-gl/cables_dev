#!/bin/bash

set -e
set -o pipefail

git pull

echo "LOADING NODEJS VERSION" `cat .nvmrc`
. ~/.nvm/nvm.sh
nvm use

echo "UPDATING CORE..."
cd cables
if [ -n "${1}" ]; then
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
npm i
cd ..

echo "UPDATING API..."
cd cables_api
if [ -n "${1}" ]; then
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
npm i
cd ..

echo "UPDATING UI..."
cd cables_ui
if [ -n "${1}" ]; then
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
npm i
cd ..
echo "DONE"
