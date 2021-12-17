# cables_dev
cables development environment

## installation

### short version
* install [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) (on plain windows install `nodejs` and `npm` for the version specified in `.nvmrc`)
* install memcached (or use `docker-compose up`)
* install mongodb (or use `docker-compose up`)
* install git
* clone this repository using  `git clone git@github.com:undev-studio/cables_dev.git`
* run `install.sh` (needs sudo password on linux)

### long/manual version

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
* add sandbox.cables.local and dev.cables.local to your hostfile (i.e. /etc/hosts)
* edit cables_api/cables.json as needed (copy from cables_api/cables_example.json first)

# ssl and mdns

* cables registers sandbox.cables.local and dev.cables.local (hostnames according to your cables.json) in mdns
* this should work on most machines, for windows you have to enable mdns or put the hostnames in "/etc/hosts" (same for linux)
  * Linux: `sudo apt-get avahi-utils`
  * Windows: install "bonjour"
* if you put "https" urls in cables.json cables will use the certificates in `./cert`
* to install them to your os-keychain use `./localcerts.sh` or download the root cert after starting the server from `http://dev.cables.local/cert`

### native dependencies mac

```
brew install GraphicsMagick
brew install imagemagick
```

### re-install
* run `install.sh` (needs sudo password on linux)

### update branches
* run `update_all.sh` to update all branches from remote and also merge `develop` into them
* run `update_all.sh develop` to switch all branches to `develop` and update from remote

### tips

* increase your "ulimit -n" (on OSX: `launchctl limit maxfiles 16384 16384 && ulimit -n 16384`)
* on linux try `sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm` (`install.sh` does that for you)
* if you have strange errors of concurrently in cables_ui: use `npm install --unsafe-perm=true`
* if you get "reached num max file watchers" errors: https://stackoverflow.com/a/56292289

## starting cables

* start cables: `npm run start`
## pick configfile
* start cables with (i.e.) `npm run start --apiConfig=public`
* cables will then use (or create from `cables_example.json`) `cables_api/cables_env_public.json` as a configfile 
## development
- update your environment by running `./update_dev.sh`
- use `npm run start` or `npm run start:all` to start the webserver
- open [http://localhost:5711/](http://localhost:5711/) in a browser
- use user `cables` password `cables` to start patching
## run api tests
- make sure cables is running locally
- pick or create two users, one with admin rights, one with user rights
- make sure (for now) the user has at least one project that is public
- add these two users to your cables.json:
- ```
    "tests": {
        "user": { "userId": "theuserid", username": "testuser", "password": "testuserpass" },
        "admin":{ "userId": "theuserid", username": "adminuser", "password": "adminpass" }
    },
  ```
- change directory to `cables_api`
- run `npm run tests` to run all tests
- run `npm run tests:api` to run api endpoint tests
- run `npm run tests:views` to run tests for html views
- all endpoints and views that do not have a dedicated test will be called with anon/user/admin to see that they don't crash
- run `npm run tests:api -- -g "should not be public"` to run tests that have "should not be public" in their description (good for running one test during development)

### visual studio code

* install extensions: `Editorconfig`, `Eslint`
 * good list of files to exclude from search:
```
*.min.js,*.max.js,*.map*,*/ace/*,*dist*,*jsdoc*,*build*,*/public/*,*/logs*
```

## scripts

### update_all.sh

reads the current nodeversion vom .nvmrc and walks the three repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm.
if given a branch, like `update_all.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

### rebuild_natives.sh

walks the three repositories and rebuild bcrypt and node-sass. sometime fixes error when
switching node versions.

### stale_branches.sh

walks the three repositories and outputs branches that have been merged to develop
and havent seen changes in at least two months. displaying the author of the last
change...these branches could be deleted on remote.
