#!/bin/sh
cd cables
git pull
npm i
cd ..
cd cables_api
npm i
git pull
cd ..
cd cables_ui
npm i
cd ..
