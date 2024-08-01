#!/bin/bash -l
#
# updates all repositories and merge develop
#

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

branch=`git rev-parse --abbrev-ref HEAD`
git fetch || true
reslog=$(git log HEAD..origin/${branch} --oneline)
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  git pull
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

set -e
set -o pipefail

echo -e ""
echo -e "${GREEN}UPDATING DEV...${NC}"
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  npm install --no-save
else
  echo -e "no changes in git, skipping update"
fi

echo -e ""
echo -e "${GREEN}UPDATING SHARED...${NC}"
cd shared
if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git fetch || true
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  git pull origin "$branch" || true
  # merge current remote develop if branch is not master
  if [ "master" != "${branch}" ]; then
      echo -e "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo -e "{$RED}not merging origin/develop into master!${NC}"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
  npm run build
else
  echo -e "no changes in git, skipping update"
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}UPDATING CORE...${NC}"
cd cables

if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git fetch || true
reslog=$(git log HEAD..origin/${branch} --oneline)
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  git pull origin "$branch" || true
  # merge current remote develop if branch is not master
  if [ "master" != "${branch}" ]; then
      echo -e "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo -e "{$RED}not merging origin/develop into master!${NC}"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
else
  echo -e "no changes in git, skipping update"
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}UPDATING EXTENSIONS...${NC}"
OPSDIR=cables/src/ops/extensions/
if [ -d "$OPSDIR" ]; then
  cd $OPSDIR
  if [ -d ".git" ]; then
      git fetch || true
      if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
        git checkout "${1}"
      fi
      branch=`git rev-parse --abbrev-ref HEAD`
      reslog=$(git log HEAD..origin/${branch} --oneline)
      if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
            git pull
      else
        echo -e "no changes in git, skipping update"
      fi
  else
      echo -e "{$RED} NOT A GIT REPO AT $OPSDIR, SKIPPING${NC}";
  fi
else
  echo -e "{$RED}DIR NOT FOUND AT $OPSDIR, SKIPPING${NC}";
fi
cd "$BASEDIR"

if [ -d cables_api ]; then
  if [ -f cables_api/package.json ]; then
    echo -e ""
      echo -e "${GREEN}UPDATING API...${NC}"
      cd cables_api

      if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
        git checkout "${1}"
      fi
      # get current branch
      branch=`git rev-parse --abbrev-ref HEAD`
      # ignore errors here, since branch might not be on remote
      git fetch || true
      reslog=$(git log HEAD..origin/${branch} --oneline)
      if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
        git pull origin "$branch" || true
        # merge current remote develop if branch is not master
        if [ "master" != "${branch}" ]; then
            echo -e "merging current state of origin/develop into ${branch}";
            git merge origin/develop;
        else
            echo -e "{$RED}not merging origin/develop into master!${NC}"
        fi
        if [ "clean" == "${1}" ]; then
          rm -rf node_modules/
        fi
        npm install --no-save
      else
        echo -e "no changes in git, skipping update"
      fi
  fi
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}UPDATING UI...${NC}"
cd cables_ui

if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
# ignore errors here, since branch might not be on remote
git fetch || true
reslog=$(git log HEAD..origin/${branch} --oneline)
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  git pull origin "${branch}" || true
  # merge current remote develop if branch is not master
  if [ "master" != "${branch}" ]; then
      echo -e "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo -e "{$RED}not merging origin/develop into master!${NC}"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
else
  echo -e "no changes in git, skipping update"
fi
cd "$BASEDIR"

if [ -d cables_electron ]; then
  echo -e ""
  echo -e "${GREEN}UPDATING ELECTRON...${NC}"
  cd cables_electron

  if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
    git checkout "${1}"
  fi
  # get current branch
  branch=`git rev-parse --abbrev-ref HEAD`
  # ignore errors here, since branch might not be on remote
  git fetch || true
  reslog=$(git log HEAD..origin/${branch} --oneline)
  if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
    git pull origin "${branch}" || true
    # merge current remote develop if branch is not master
    if [ "master" != "${branch}" ]; then
        echo -e "merging current state of origin/develop into ${branch}";
        git merge origin/develop;
    else
        echo -e "{$RED}not merging origin/develop into master!${NC}"
    fi
    if [ "clean" == "${1}" ]; then
      rm -rf node_modules/
    fi
    npm install --no-save
  else
    echo -e "no changes in git, skipping update"
  fi
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}DONE${NC}"
