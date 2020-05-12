# cables_dev
cables development environment

install:

```
git clone git@github.com:undev-studio/cables_dev.git
cd cables_dev
npm i
git clone git@github.com:pandrr/cables.git
git clone git@github.com:undev-studio/cables_api.git
git clone git@github.com:undev-studio/cables_ui.git
cd cables_api
git checkout develop
npm i
cd ..
cd cables_ui
git checkout develop
touch scss/svgicons.scss
npm i
cd ..
cd cables
git checkout develop
npm i
cd ..
```

* start cables without mongodb & memcached: `npm run start`
* start cables with mongodb & memcached: `npm run start:all`

# tips

* on linux try `sudo apt-get install gcc g++ build-essential autoconf libpng-dev nasm`
* if you have strange errors of concurrently in cables_ui: use `npm install --unsafe-perm=true`

# visual studio code

* install extensions: `Editorconfig`, `Eslint`
 * good list of files to exclude from search:
```
*.min.js,*.max.js,*.map*,*/ace/*,*dist*,*jsdoc*,*build*,*/public/*,*/logs*
```

# scrips

## update_all.sh

reads the current nodeversion vom .nvmrc and walks the three repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm.
if given a branch, like `update_all.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

## rebuild_natives.sh

walks the three repositories and rebuild bcrypt and node-sass. sometime fixes error when
switching node versions.

## stale_branches.sh

walks the three repositories and outputs branches that have been merged to develop
and havent seen changes in at least two months. displaying the author of the last
change...these branches could be deleted on remote.
