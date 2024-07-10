#!/bin/bash -l
#
# updates all repositories and merge develop
#

ENV_FILE=.env
if [ -f $ENV_FILE ]; then
  source .env
fi
CABLES_DEV_REPO="${CABLES_DEV_REPO:=git@github.com:cables-gl/cables_dev.git}"
CABLES_CORE_REPO="${CABLES_CORE_REPO:=git@github.com:cables-gl/cables.git}"
CABLES_API_REPO="${CABLES_API_REPO:=git@github.com:undev-studio/cables_api.git}"
CABLES_UI_REPO="${CABLES_UI_REPO:=git@github.com:cables-gl/cables_ui.git}"
CABLES_ELECTRON_REPO="${CABLES_ELECTRON_REPO:=git@github.com:cables-gl/cables_electron.git}"
CABLES_ASSET_LIBRARY_REPO="${CABLES_ASSET_LIBRARY_REPO:=git@github.com:cables-gl/cables-asset-library.git}"

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
WARNING='\033[0;31m'
NC='\033[0m' # No Color

# maybe change remote url
ORIGIN_URL=`git remote get-url origin`
if [ "$ORIGIN_URL" != "$CABLES_DEV_REPO" ]; then
  echo "CHANGING ORIGIN: cables_dev TO ${CABLES_DEV_REPO} - confirm by pressing any key, cancel with ctrl-c"
  while [ true ]; do read -n 1; if [ $? = 0 ]; then break; fi; done
  git remote set-url origin ${CABLES_DEV_REPO}
fi

branch=`git rev-parse --abbrev-ref HEAD`
git fetch || true
reslog=$(git log HEAD..origin/${branch} --oneline)
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  git pull
fi

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

echo "UPDATING DEV..."
if [[ "${reslog}" != "" || "force" = "${1}" ]] ; then
  npm install --no-save
else
  echo "no changes in git, skipping update"
fi

echo "UPDATING SHARED..."
cd shared
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
      echo "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo "WARNING: not merging origin/develop into master!"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
  npm run build
else
  echo "no changes in git, skipping update"
fi
cd $BASEDIR

echo "UPDATING CORE..."
cd cables

# maybe change remote url
ORIGIN_URL=`git remote get-url origin`
if [ "$ORIGIN_URL" != "$CABLES_CORE_REPO" ]; then
  echo "CHANGING ORIGIN: cables TO ${CABLES_CORE_REPO} - confirm by pressing any key, cancel with ctrl-c"
  while [ true ]; do read -n 1; if [ $? = 0 ]; then break; fi; done
  git remote set-url origin ${CABLES_CORE_REPO}
fi

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
      echo "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo "${WARNING}not merging origin/develop into master!${NC}"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
else
  echo "no changes in git, skipping update"
fi
cd $BASEDIR

echo "UPDATING EXTENSIONS..."
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
        echo "no changes in git, skipping update"
      fi
  else
      echo "${WARNING} NOT A GIT REPO AT $OPSDIR, SKIPPING${NC}";
  fi
else
  echo "${WARNING}DIR NOT FOUND AT $OPSDIR, SKIPPING${NC}";
fi
cd $BASEDIR

if [ -d cables_api ]; then
  echo "UPDATING API..."
  cd cables_api

  # maybe change remote url
  ORIGIN_URL=`git remote get-url origin`
  if [ "$ORIGIN_URL" != "$CABLES_API_REPO" ]; then
    echo "CHANGING ORIGIN: cables_api TO ${CABLES_API_REPO} - confirm by pressing any key, cancel with ctrl-c"
    while [ true ]; do read -n 1; if [ $? = 0 ]; then break; fi; done
    git remote set-url origin ${CABLES_API_REPO}
  fi

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
        echo "merging current state of origin/develop into ${branch}";
        git merge origin/develop;
    else
        echo "${WARNING}not merging origin/develop into master!${NC}"
    fi
    if [ "clean" == "${1}" ]; then
      rm -rf node_modules/
    fi
    npm install --no-save
  else
    echo "no changes in git, skipping update"
  fi
fi
cd $BASEDIR

echo "UPDATING UI..."
cd cables_ui

# maybe change remote url
ORIGIN_URL=`git remote get-url origin`
if [ "$ORIGIN_URL" != "$CABLES_UI_REPO" ]; then
  echo "CHANGING ORIGIN: cables_ui TO ${CABLES_UI_REPO} - confirm by pressing any key, cancel with ctrl-c"
  while [ true ]; do read -n 1; if [ $? = 0 ]; then break; fi; done
  git remote set-url origin ${CABLES_UI_REPO}
fi

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
      echo "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
  else
      echo "${WARNING}not merging origin/develop into master!${NC}"
  fi
  if [ "clean" == "${1}" ]; then
    rm -rf node_modules/
  fi
  npm install --no-save
else
  echo "no changes in git, skipping update"
fi
cd $BASEDIR

if [ -d cables_electron ]; then
  echo "UPDATING ELECTRON..."
  cd cables_electron

  # maybe change remote url
  ORIGIN_URL=`git remote get-url origin`
  if [ "$ORIGIN_URL" != "$CABLES_ELECTRON_REPO" ]; then
    echo "CHANGING ORIGIN: cables_electron TO ${CABLES_ELECTRON_REPO} - confirm by pressing any key, cancel with ctrl-c"
    while [ true ]; do read -n 1; if [ $? = 0 ]; then break; fi; done
    git remote set-url origin ${CABLES_ELECTRON_REPO}
  fi

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
        echo "merging current state of origin/develop into ${branch}";
        git merge origin/develop;
    else
        echo "${WARNING}not merging origin/develop into master!${NC}"
    fi
    if [ "clean" == "${1}" ]; then
      rm -rf node_modules/
    fi
    npm install --no-save
  else
    echo "no changes in git, skipping update"
  fi
fi
cd $BASEDIR

echo "DONE"
