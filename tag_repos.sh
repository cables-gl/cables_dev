#!/bin/bash -l
#
# checks out repos at branch, updates, then tags them with the same tag
#

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

WAIT=10
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
git fetch || true

set -e
set -o pipefail

echo -e ""
echo -e "${GREEN}TAGGING DEV...${NC}"
if [[ `git status --porcelain --untracked-files=no` ]]; then
  echo -e "${RED}repository has local changes stash/commit before you tag...${NC}"
  exit 1
fi
branch=`git rev-parse --abbrev-ref HEAD`
echo -e "${GREEN}tagging current state of '${branch}' with '${1}'...${NC}"
git tag "${1}"
git push origin tag "${1}"

echo -e ""
echo -e "${GREEN}TAGGING CORE...${NC}"
cd cables
if [[ `git status --porcelain --untracked-files=no` ]]; then
  echo -e "${RED}repository has local changes stash/commit before you tag...${NC}"
  exit 1
fi
branch=`git rev-parse --abbrev-ref HEAD`
echo -e "${GREEN}tagging current state of '${branch}' with '${1}'...${NC}"
git tag "${1}"
git push origin tag "${1}"
cd "$BASEDIR"

if [ -d cables_api ]; then
  if [ -f cables_api/package.json ]; then
    echo -e ""
    echo -e "${GREEN}TAGGING API...${NC}"
    if [[ `git status --porcelain --untracked-files=no` ]]; then
      echo -e "${RED}repository has local changes stash/commit before you tag...${NC}"
      exit 1
    fi
    branch=`git rev-parse --abbrev-ref HEAD`
    echo -e "${GREEN}tagging current state of '${branch}' with '${1}'...${NC}"
    cd cables_api
    git tag "${1}"
    git push origin tag "${1}"
  fi
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}TAGGING UI...${NC}"
cd cables_ui
if [[ `git status --porcelain --untracked-files=no` ]]; then
  echo -e "${RED}repository has local changes stash/commit before you tag...${NC}"
  exit 1
fi
branch=`git rev-parse --abbrev-ref HEAD`
echo -e "${GREEN}tagging current state of '${branch}' with '${1}'...${NC}"
git tag "${1}"
git push origin tag "${1}"
cd "$BASEDIR"

if [ -d cables_electron ]; then
  echo -e ""
  echo -e "${GREEN}TAGGING ELECTRON...${NC}"
  cd cables_electron
  if [[ `git status --porcelain --untracked-files=no` ]]; then
    echo -e "${RED}repository has local changes stash/commit before you tag...${NC}"
    exit 1
  fi
  branch=`git rev-parse --abbrev-ref HEAD`
  echo -e "${GREEN}tagging current state of '${branch}' with '${1}'...${NC}"
  git tag "${1}"
  git push origin tag "${1}"
fi
cd "$BASEDIR"

echo -e ""
echo -e "${GREEN}DONE${NC}"
