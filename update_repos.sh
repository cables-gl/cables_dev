#!/bin/bash -l
#
# updates all repositories and merge develop
#

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

FORCE=false
if [ -n "${1}" ] ; then
  FORCE=true
fi

CLEAN=false
if [[ "${1}" =~ ^(clean|tags/v.*)$ ]] ; then
  CLEAN=true
fi

branch=`git rev-parse --abbrev-ref HEAD`
git fetch || true

# set pull/merge strategy
git config --local pull.ff true
git config --local pull.rebase false

# shared is part of this repository, changes there are also compared to this revision
DEV_BEFORE=$(git rev-parse HEAD)
reslog=$(git log HEAD..origin/${branch} --oneline)
if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
  git pull --no-edit
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

# lists the given files that changed in git between a revision and HEAD, paths are relative to the current directory
# arguments: revision before the update, files
changed_since() {
  local before="$1"
  shift
  if [ -n "${before}" ]; then git diff --name-only "${before}" HEAD -- "$@"; fi
}

# runs npm install if forced or if the package files of the current directory changed with the update
# arguments: revision before the update, changes in file: dependencies of this repository (any non-empty value triggers an install)
npm_install_if_needed() {
  local before="$1"
  local dependencyChanges="$2"
  local changes
  changes=$(changed_since "${before}" package.json package-lock.json .npmrc .nvmrc)
  if [ "${FORCE}" = true ]; then
    echo -e "forced, running npm install"
  elif [ -n "${changes}" ]; then
    echo -e "changes in" ${changes}", running npm install"
  elif [ -n "${dependencyChanges}" ]; then
    echo -e "changes in dependencies" ${dependencyChanges}", running npm install"
  else
    echo -e "no changes in package files, skipping npm install"
    return 0
  fi
  npm install --no-save
}

echo -e ""
echo -e "${GREEN}UPDATING DEV...${NC}"
npm_install_if_needed "${DEV_BEFORE}"

echo -e ""
echo -e "${GREEN}UPDATING SHARED...${NC}"
cd shared
if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git -c advice.detachedHead=false checkout "${1}"
fi

# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
if [[ "${branch}" = "HEAD" && "${1}" =~ ^tags/v.*$ ]]; then branch=$1; fi

# ignore errors here, since branch might not be on remote
git fetch || true

# set pull/merge strategy
git config --local pull.ff true
git config --local pull.rebase false

if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
  git pull --no-edit origin "$branch" || true
  # merge current remote develop if branch is not master or tag
  if [[ "${branch}" =~ ^(master|tags/v.*)$ || "${1}" =~ ^tags/v.*$ ]]; then
    echo -e "${RED}not merging origin/develop into master/tag!${NC}"
  else
    echo -e "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
  fi
  if [ "$CLEAN" = true ]; then
    rm -rf node_modules/
  fi
  npm_install_if_needed "${DEV_BEFORE}"
  npm run build
else
  echo -e "no changes in git, skipping update"
fi
# used as file: dependencies by the other repositories
SHARED_API_CHANGES=$(changed_since "${DEV_BEFORE}" api/package.json api/package-lock.json)
SHARED_CLIENT_CHANGES=$(changed_since "${DEV_BEFORE}" client/package.json client/package-lock.json)
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}UPDATING CORE...${NC}"
cd cables

if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git -c advice.detachedHead=false checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
if [[ "${branch}" = "HEAD" && "${1}" =~ ^tags/v.*$ ]]; then branch=$1; fi

# ignore errors here, since branch might not be on remote
git fetch || true

# set pull/merge strategy
git config --local pull.ff true
git config --local pull.rebase false

if ! [[ "${branch}" =~ ^tags/v.*$ ]]; then reslog=$(git log HEAD..origin/${branch} --oneline); fi

CORE_BEFORE=""
if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
  CORE_BEFORE=$(git rev-parse HEAD)
  git pull --no-edit origin "$branch" || true
  # merge current remote develop if branch is not master or tag
  if [[ "${branch}" =~ ^(master|tags/v.*)$ || "${1}" =~ ^tags/v.*$ ]]; then
    echo -e "${RED}not merging origin/develop into master/tag!${NC}"
  else
    echo -e "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
  fi
  if [ "$CLEAN" = true ]; then
    rm -rf node_modules/
  fi
  # postinstall installs the corelibs
  npm_install_if_needed "${CORE_BEFORE}" "$(changed_since "${CORE_BEFORE}" src/corelibs/package.json src/corelibs/package-lock.json)${SHARED_CLIENT_CHANGES}"
  npm run build
else
  echo -e "no changes in git, skipping update"
  npm_install_if_needed "" "${SHARED_CLIENT_CHANGES}"
fi
# used as file: dependencies by cables_ui
CORE_CHANGES=$(changed_since "${CORE_BEFORE}" package.json package-lock.json src/corelibs/package.json src/corelibs/package-lock.json)
cd "$BASEDIR"

if [ -d cables_api ]; then
  if [ -f cables_api/package.json ]; then
    echo -e ""
      echo -e "${GREEN}UPDATING API...${NC}"
      cd cables_api

      if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
        git -c advice.detachedHead=false checkout "${1}"
      fi
      # get current branch
      branch=`git rev-parse --abbrev-ref HEAD`
      if [[ "${branch}" = "HEAD" && "${1}" =~ ^tags/v.*$ ]]; then branch=$1; fi

      # ignore errors here, since branch might not be on remote
      git fetch || true

      # set pull/merge strategy
      git config --local pull.ff true
      git config --local pull.rebase false

      if ! [[ "${branch}" =~ ^tags/v.*$ ]]; then reslog=$(git log HEAD..origin/${branch} --oneline); fi

      if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
        API_BEFORE=$(git rev-parse HEAD)
        git pull --no-edit origin "$branch" || true
        # merge current remote develop if branch is not master or tag
        if [[ "${branch}" =~ ^(master|tags/v.*)$ || "${1}" =~ ^tags/v.*$ ]]; then
          echo -e "${RED}not merging origin/develop into master/tag!${NC}"
        else
          echo -e "merging current state of origin/develop into ${branch}";
          git merge origin/develop;
        fi
        if [ "$CLEAN" = true ]; then
          rm -rf node_modules/
        fi
        npm_install_if_needed "${API_BEFORE}" "${SHARED_API_CHANGES}${SHARED_CLIENT_CHANGES}"
        npm run build
      else
        echo -e "no changes in git, skipping update"
        npm_install_if_needed "" "${SHARED_API_CHANGES}${SHARED_CLIENT_CHANGES}"
      fi
  fi
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}UPDATING UI...${NC}"
cd cables_ui

if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
	git -c advice.detachedHead=false checkout "${1}"
fi
# get current branch
branch=`git rev-parse --abbrev-ref HEAD`
if [[ "${branch}" = "HEAD" && "${1}" =~ ^tags/v.*$ ]]; then branch=$1; fi

# ignore errors here, since branch might not be on remote
git fetch || true

# set pull/merge strategy
git config --local pull.ff true
git config --local pull.rebase false

if ! [[ "${branch}" =~ ^tags/v.*$ ]]; then reslog=$(git log HEAD..origin/${branch} --oneline); fi

if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
  UI_BEFORE=$(git rev-parse HEAD)
  git pull --no-edit origin "${branch}" || true
  # merge current remote develop if branch is not master or tag
  if [[ "${branch}" =~ ^(master|tags/v.*)$ || "${1}" =~ ^tags/v.*$ ]]; then
    echo -e "${RED}not merging origin/develop into master/tag!${NC}"
  else
    echo -e "merging current state of origin/develop into ${branch}";
    git merge origin/develop;
  fi
  if [ "$CLEAN" = true ]; then
    rm -rf node_modules/
  fi
  npm_install_if_needed "${UI_BEFORE}" "${CORE_CHANGES}${SHARED_CLIENT_CHANGES}"
  npm run build
else
  echo -e "no changes in git, skipping update"
  npm_install_if_needed "" "${CORE_CHANGES}${SHARED_CLIENT_CHANGES}"
fi
cd "$BASEDIR"

if [ -d cables_electron ]; then
  echo -e ""
  echo -e "${GREEN}UPDATING ELECTRON...${NC}"
  cd cables_electron

  if [ -n "${1}" ] && ! [[ "${1}" =~ ^(clean|force)$ ]]; then
    git -c advice.detachedHead=false checkout "${1}"
  fi
  # get current branch
  branch=`git rev-parse --abbrev-ref HEAD`
  # ignore errors here, since branch might not be on remote
  git fetch || true

  # set pull/merge strategy
  git config --local pull.ff true
  git config --local pull.rebase false

  if ! [[ "${branch}" =~ ^tags/v.*$ ]]; then reslog=$(git log HEAD..origin/${branch} --oneline); fi

  if [[ "${reslog}" != "" || "${FORCE}" = true ]] ; then
    ELECTRON_BEFORE=$(git rev-parse HEAD)
    git pull --no-edit origin "${branch}" || true
    # merge current remote develop if branch is not master or tag
    if [[ "${branch}" =~ ^(master|tags/v.*)$ || "${1}" =~ ^tags/v.*$ ]]; then
      echo -e "${RED}not merging origin/develop into master/tag!${NC}"
    else
      echo -e "merging current state of origin/develop into ${branch}";
      git merge origin/develop;
    fi
    if [ "$CLEAN" = true ]; then
      rm -rf node_modules/
    fi
    npm_install_if_needed "${ELECTRON_BEFORE}" "${SHARED_API_CHANGES}${SHARED_CLIENT_CHANGES}"
  else
    echo -e "no changes in git, skipping update"
    npm_install_if_needed "" "${SHARED_API_CHANGES}${SHARED_CLIENT_CHANGES}"
  fi
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}DONE${NC}"
