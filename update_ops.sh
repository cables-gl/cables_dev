#!/bin/bash -l
# update userops/teamops if the default-dirs exist

git pull

set -e
set -o pipefail

CWD=`pwd`

cd cables
cd src/ops/
BASEDIR=`pwd`

OPSDIR=$BASEDIR/users/
branch="master"
if [ -d "$OPSDIR" ]; then
  echo "UPDATING USEROPS..."
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

OPSDIR=$BASEDIR/teams/
branch="main"
if [ -d "$OPSDIR" ]; then
  echo "UPDATING TEAMOPS..."
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

cd $CWD
if [ -d cables_api ]; then
  if [ -f cables_api/package.json ]; then
    echo "UPDATING OPDOCS..."
    cd $CWD/cables_api
    npm run opdocs
  fi
fi
cd $CWD

echo "DONE"
