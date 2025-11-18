echo "----- share dev"
git checkout $1
cd cables
echo "----- core"
git checkout $1
cd ..
cd cables_ui
echo "----- ui"
git checkout $1
cd ..
