#!/bin/bash -l 


cd ~/cables/cables
npm run build
cd -
cd ~/cables/cables_ui
npm run build
cd -
