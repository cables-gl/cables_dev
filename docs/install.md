## installation

### short version

* install [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) (on plain windows install `nodejs` and `npm` for the version specified in `.nvmrc`)
* install and run memcached (or use `docker-compose up`)
* install and run mongodb (or use `docker-compose up`)
* install git
* clone this repository using  `git clone git@github.com:cables-gl/cables_dev.git`
* run `. ./install_local.sh` (needs sudo password on linux, NOTICE THE EXTRA DOT AT THE BEGINNING!)
* make sure your current shell has the proper node version `node --version` (if not, open a new terminal before you start the server, and check again)
* run `npm run start` and open a browser on 'http://localhost:5711' (see below for other options)

### long/manual version

install:

```
git clone git@github.com:cables-gl/cables_dev.git
cd cables_dev
npm i
git clone git@github.com:pandrr/cables.git
git clone git@github.com:undev-studio/cables_api.git
git clone git@github.com:cables-gl/cables_ui.git
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
* edit cables_api/cables.json as needed (copy from cables_api/cables_example.json first)

## ssl and mdns

* if needed, cables can run a mdns client to make your environment available to machines on the local network
* make sure you can run servers on port 80 and 443 and have nothing else running on these ports!
  * on linux try `nvm use` and ``sudo setcap 'cap_net_bind_service=+ep' `which node` `` in this current directory
* if you want to access these ports from other machines on the network, make sure they are not firewalled locally
* change `url` and `sandbox.url` in `cables.json` to something like `https://local.cables.local` and `https://sandbox.cables.local` respectively
* add urls to cors list

### mdns
* cables registers sandbox.cables.local and dev.cables.local (hostnames according to your cables.json) in mdns
* this should work on most machines, for windows you have to enable mdns or  (same for linux)
  * Linux: `sudo apt-get install avahi-utils`
    * https://github.com/lathiat/avahi
    * put the hostnames in `/etc/hosts`
  * Windows: install "bonjour",
    * run this in `cmd`: `reg add "HKLM\Software\Policies\Microsoft\Windows NT\DNSClient" /v EnableMulticast /t REG_DWORD /d 1 /f`
    * very unreliable on windows
    * put the hostnames in `%windir%\system32\drivers\etc\HOSTS`

### ssl
* if you put "https" urls in cables.json cables will use the certificates in `./cert`
* to install them to your os-keychain download the cert-chain from `http://local.cables.local/cert`
  * or try running `./localcerts.sh`
* IOS: after installing go to settings, search for cert, click trusted certificates - activate toggle "enable full trust...."
* windows:
  * download the cert-chain from `http://local.cables.local/cert`
  * for firefox: open settings, privacy, pick "certificates" and import the dowloaded rootCA.pem
  * for other browsers:
    * login as admin
    * open startmenu, type "cert", pick "manage computer certifcates", click "yes"
    * pick folder "trusted root certification authorities"
    * from the menu select "action", "all tasks", "import"
    * make sure next dialog has "local machine" selected, click "next"
    * pick the downloaded rootCA.pem (you may need to select "all files" to see it)
    * click next, "certificate store" should be "trusted root certification authorities", click next
    * click "finish"
    * test in chrome
* to regenerate use `./localcerts.sh renew`
* you may have to visit https://sandboxlocal.cables.local/ui/js/cables.max.js and accept the risc etc...

## local default assets
* to get cables default assets locally:
  * clone `https://github.com/cables-gl/cables-asset-library` into cables_api/public/assets/library
  * if you ran `install_local.sh` this is already in place

## socketcluster/multiplayer

* if you want socketcluster/multiplayer capabilities on your local environment, follow these instructions:

### client
* if you want to connect to the dev.cables.gl server, set `socketClusterClient.enable` to `true` in `cables.json`
  and get the secret for `socketClusterServer.secret` from dev

### server
* if you want to run a local server, change to `cables_api` and run `npm run start:socketcluster
  * change the options for `socketClusterClient` in `cables.json` to match up with `socketClusterServer`, you will most likely want to set `secure` to `false`

## push notifications
* if you want to get push notifications for the activityfeed locally:
  * generate a vapid token (https://vapidkeys.com/)
  * edit the "webPush" section in cables.json, or copy from live/dev
  * (re)-start the server

## local docs
* checkout `https://github.com/cables-gl/cables_docs` to (i.e. this current directory)
* update `paths.docs_md` in `cables.json` with the proper (relative) directory path
* restart server, go to (i.e) 'http://localhost:5711/docs/'

## local electron/exe export
* download electron for the supported platforms from https://github.com/electron/electron/releases
* put them into a subdirectory of this current directory named `electron/win32-x64`, currently supported:
  * win32-x64
  * linux-x64
  * darwin-x64
  * darwin-arm64
* update `paths.electron` in `cables.json` with the proper (relative) directory path

## native dependencies mac

```
brew install GraphicsMagick
brew install imagemagick
```

## re-install
* run `install_local.sh` (needs sudo password on linux)

## update branches
* run `update_repos.sh` to update all branches from remote and also merge `develop` into them
* run `update_repos.sh develop` to switch all branches to `develop` and update from remote

## tips

* mac os: if strange cpu or build errors (e.g. autoconf,libpng,mozjpeg,pngquant,webp etc) try `softwareupdate --install-rosetta`
* increase your "ulimit -n" (on OSX: `launchctl limit maxfiles 16384 16384 && ulimit -n 16384`)
* on linux try
  * `sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm` (`install_local.sh` does that for you)
* if you have strange errors of concurrently in cables_ui: use `npm install --unsafe-perm=true`
* if you get "reached num max file watchers" errors: https://stackoverflow.com/a/56292289
* how to don't get binary merge conflicts:
  * `git config --global merge.ours.driver true`

## starting cables

* start cables: `npm run start`

### pick configfile
* start cables with (i.e.) `npm run start --apiconfig=public`
* cables will then use (or create from `cables_example.json`) `cables_api/cables_env_public.json` as a configfile

## development
- update your environment by running `./update_repos.sh`
- use `npm run start` to start the webserver
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

## visual studio code

* install extensions: `Editorconfig`, `Eslint`
* add this to your settings.json so the imports jave a .js suffix:
```
    "javascript.preferences.importModuleSpecifierEnding": "js",
    "typescript.preferences.importModuleSpecifierEnding": "js",
```
* vscode: in eslint config set to "code actions on save mode" to "all"
* vscode: open workspace via "open workspace from file" only from system menu, option not available in the welcome/open panel
* good list of files to exclude from search:
```
*.min.js,*.max.js,*.map*,*/ace/*,*dist*,*jsdoc*,*build*,*/public/*,*/logs*
```
## copy jobs in build process

### cables
#### watch
- on changes to anything in `src/core`
  - copies `build/` to `cables_ui/dist/js` ignoring `libs/` and `buildinfo.json`
  - copies `build/libs/` to `cables_api/public/libs_core`
- on changes to anything in `libs/`
  - copies `build/` to `cables_ui/dist/js` ignoring `libs/` and `buildinfo.json`
- on changes to anything in `src/libs/`
  - copies `build/libs/` to `cables_api/public/libs_core`
#### build
- copies `build/libs/` to `cables_api/public/libs_core`
### cables_api
#### build
- copies `../cables/build/libs/*.js` to `public/libs_core/`
### cables_ui
#### watch

#### build
- copies `../cables/build/` to `dist/js/` ignoring `libs/` and `buildinfo.json`
- copies `svgicons.scss` to `../cables_api/scss/`
-
## scripts

### build_all.sh

enters all repositories and runs `npm run build`

### install_local.sh

tries to guess your OS, installs dependencies, creates needed directories and files and copies
`cables_example.json` to `cables.json` if it does not exist

### localcerts.sh

uses `mkcert` to add selfsigned certificates to your systems keychaing. adding the parameter `renew` will renew
the certificates to commit to the repository when expired.

### update_repos.sh

reads the current nodeversion vom .nvmrc and walks the three repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm.
if given a branch, like `update_repos.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

### hook_api.sh

* intended for webhook on dev
* pulls current branch of `cables-gl/cables_api`
* runs `npm` to build
* restarts pm2 servers `api` and `sandbox`

### hook_core.sh

* intended for webhook on dev
* pulls current branch of `pandrr/cables`
* runs `npm` to build
* runs `npm` to build `cables_ui` to copy over updates

### hook_ui.sh

* intended for webhook on dev
* pulls current branch of `cables-gl/cables_ui`
* runs `npm` to build

### hook_docs.sh

* intended for webhook on dev/live
* pulls current branch of `cables-gl/cables_docs`

### hook_exe_export.sh

* intended for webhook on dev/live
* pulls current branch of `cables-gl/cables-exe-export`

### hook_quotas_daily.sh

* intended for webhook on dev/live
* runs `npm run quota:daily` in `cables_api` sets userquota-usage to 0 for quotas defined in `cables_api/package.json`

### update_live.sh

* intended for live only!
* makes sure wanted nodeversion is installed
* makes sure all the repositories are on `master` branch
* pulls `master` for all repostiories
* runs `npm` to build all the repositories
* on live: run `pm2 restart all` afterwards!

### update_ops.sh

* updates patchops/userops/teamops/extensionops
* repositories need to be checked out to cables/src/ops/users, cables/ops/teams, ...
* pulls `master` and `main` for all repostiories
* runs `npm run opdocs` in cables_api to refresh caches
