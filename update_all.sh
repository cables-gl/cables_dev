#!/bin/sh
cd cables
git pull
git merge origin/develop
npm i
cd ..
cd cables_api
npm i
git pull
git merge origin/develop
cd ..
cd cables_ui
git pull
git merge origin/develop
npm i
cd ..
