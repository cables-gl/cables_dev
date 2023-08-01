#!/bin/bash -l
# update userops/teamops/extensions if the default-dirs exist

git pull

set -e
set -o pipefail

CWD=`pwd`

cd cables
cd src/ops/
BASEDIR=`pwd`

echo "UPDATING USEROPS..."
OPSDIR=$BASEDIR/users/
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

echo "UPDATING TEAMOPS..."
OPSDIR=$BASEDIR/teams/
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

echo "UPDATING EXTENSIONS..."
OPSDIR=$BASEDIR/extensions/
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

cd $CWD/cables_api
npm run opdocs

echo "DONE"
