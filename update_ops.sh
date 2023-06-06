#!/bin/bash -l
# update userops/teamops/extensions if the default-dirs exist

git pull

set -e
set -o pipefail

cd cables
cd src/ops/

echo "UPDATING USEROPS..."
OPSDIR=`pwd`/users/
branch="master"
if [ -d "$OPSDIR" ]; then
  cd $OPSDIR
  if [ -d ".git" ]; then
      git checkout $branch
      git pull
  else
      echo "  NOT A GIT REPO AT $OPSDIR, SKIPPING";
  fi
else
  echo "  DIR NOT FOUND AT $OPSDIR, SKIPPING";
fi
cd ..

echo "UPDATING TEAMOPS..."
OPSDIR=`pwd`/teams/
branch="main"
if [ -d "$OPSDIR" ]; then
  cd $OPSDIR
  if [ -d ".git" ]; then
      git checkout $branch
      git pull
  else
      echo "  NOT A GIT REPO AT $OPSDIR, SKIPPING";
  fi
else
  echo "  DIR NOT FOUND AT $OPSDIR, SKIPPING";
fi
cd ..

echo "UPDATING EXTENSIONS..."
OPSDIR=`pwd`/extensions/
branch="main"
if [ -d "$OPSDIR" ]; then
  cd $OPSDIR
  if [ -d ".git" ]; then
      git checkout $branch
      git pull
  else
      echo "  NOT A GIT REPO AT $OPSDIR, SKIPPING";
  fi
else
  echo "  DIR NOT FOUND AT $OPSDIR, SKIPPING";
fi
cd ..

echo "DONE"
