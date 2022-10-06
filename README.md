# cables_dev
cables development environment

## installation

### short version

* install [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) (on plain windows install `nodejs` and `npm` for the version specified in `.nvmrc`)
* install memcached (or use `docker-compose up`)
* install mongodb (or use `docker-compose up`)
* install git
* clone this repository using  `git clone git@github.com:undev-studio/cables_dev.git`
* run `install_local.sh` (needs sudo password on linux)
* run `npm run start` and open a browser on 'http://localhost:5711' (see below for other options)

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
* edit cables_api/cables.json as needed (copy from cables_api/cables_example.json first)

## ssl and mdns

* if needed, cables can run a mdns client to make your environment available to machines on the local network
* change `url` and `sandbox.url` in `cables.json` to something like `https://local.cables.local` and `https://sandbox.cables.local` respectively
* make sure you can run servers on port 80 and 443, on linux try: ``

### mdns
* cables registers sandbox.cables.local and dev.cables.local (hostnames according to your cables.json) in mdns
* this should work on most machines, for windows you have to enable mdns or put the hostnames in "/etc/hosts" (same for linux)
  * Linux: `sudo apt-get avahi-utils`
    * https://github.com/lathiat/avahi
  * Windows: install "bonjour",
    * run this in `cmd`: `reg add "HKLM\Software\Policies\Microsoft\Windows NT\DNSClient" /v EnableMulticast /t REG_DWORD /d 1 /f`
    * very unreliable on windows

### ssl
* if you put "https" urls in cables.json cables will use the certificates in `./cert`
* to install them to your os-keychain download the cert-chain from `http://local.cables.local/cert`
  * or try running `./localcerts.sh`
* IOS: after installing go to settings, search for cert, click trusted certificates - activate toggle "enable full trust...."
* to regenerate use `./localcerts.sh renew`

## socketcluster/multiplayer

* if you want socketcluster/multiplayer capabilities on your local environment, follow these instructions:

### client
* if you want to connect to the dev.cables.gl server, set `socketClusterClient.enable` to `true` in `cables.json`
  and get the secret for `socketClusterServer.secret` from dev

### server
* if you want to run a local server, change to `cables_api` and run `npm run start:socketcluster
  * change the options for `socketClusterClient` in `cables.json` to match up with `socketClusterServer`, you will most likely want to set `secure` to `false`

### native dependencies mac

```
brew install GraphicsMagick
brew install imagemagick
```

### re-install
* run `install_local.sh` (needs sudo password on linux)

### update branches
* run `update_dev.sh` to update all branches from remote and also merge `develop` into them
* run `update_dev.sh develop` to switch all branches to `develop` and update from remote

### tips

* increase your "ulimit -n" (on OSX: `launchctl limit maxfiles 16384 16384 && ulimit -n 16384`)
* on linux try `sudo apt-get install python gcc g++ build-essential autoconf libpng-dev nasm` (`install_local.sh` does that for you)
* if you have strange errors of concurrently in cables_ui: use `npm install --unsafe-perm=true`
* if you get "reached num max file watchers" errors: https://stackoverflow.com/a/56292289

## starting cables

* start cables: `npm run start`

## pick configfile
* start cables with (i.e.) `npm run start --apiconfig=public`
* cables will then use (or create from `cables_example.json`) `cables_api/cables_env_public.json` as a configfile

## development
- update your environment by running `./update_all.sh`
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

### visual studio code

* install extensions: `Editorconfig`, `Eslint`
 * good list of files to exclude from search:
```
*.min.js,*.max.js,*.map*,*/ace/*,*dist*,*jsdoc*,*build*,*/public/*,*/logs*
```

## scripts

### build_all.sh

enters all repositories and runs `npm run build`

### install_local.sh

tries to guess your OS, installs dependencies, creates needed directories and files and copies
`cables_example.json` to `cables.json` if it does not exist

### localcerts.sh

uses `mkcert` to add selfsigned certificates to your systems keychaing. adding the parameter `renew` will renew
the certificates to commit to the repository when expired.

### update_all.sh

reads the current nodeversion vom .nvmrc and walks the three repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm.
if given a branch, like `update_all.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

### update_api.sh

* intended for dev/live
* pulls current branch of `cables_api`
* runs `npm` to build
* restarts pm2 servers `api` and `sandbox`

### update_core.sh

* intended for dev/live
* pulls current branch of `cables`
* runs `npm` to build
* runs `npm` to build `cables_ui` to copy over updates

### update_docs.sh

* intended for dev/live
* pulls current branch of `cables_docs`

### update_live.sh

* intended for live only!
* makes sure wanted nodeversion is installed
* makes sure all the repositories are on `master` branch
* pulls `master` for all repostiories
* runs `npm` to build all the repositories
* on live: run `pm2 restart all` afterwards!

### update_ui.sh

* intended for dev/live
* pulls current branch of `cables_ui`
* runs `npm` to build
