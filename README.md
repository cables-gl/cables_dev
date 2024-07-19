# cables development environment

## structure

cables development is spread across five git-repositories

### [cables_dev](https://github.com/cables-gl/cables_dev)

### [cables](https://github.com/cables-gl/cables)

### [cables_ui](https://github.com/cables-gl/cables_ui)

### [cables_electron](https://github.com/cables-gl/cables_electron)

### [cables_extensionops](https://github.com/undev-studio/cables_extensionops)

## Set up local environment (for standalone version) - quick start

This quick start will install the cables dev environment for you, and all that is needed to start making changes to cables.
The setup relies on the [bash shell](https://www.gnu.org/software/bash/), which should be present on osx and linux, and
we will install it on windows. You should be somewhat familiar with working with [nodejs](https://nodejs.org/), but we
will guide you as much as possible.

In these steps we will clone the cables default repositories, once that is done, you can start working with your fork,
if you created one.

The scripts included in these steps and this repository are described in a [separate document](docs/howto_helper_scripts.md). 

But let's get started:

### Mac/Linux
- install [git](https://github.com/git-guides/install-git)
- clone [this repository](https://github.com/cables-gl/cables_dev)
- change into the checked out directory (`cd cables_dev/`)
- continue [below](#common)

### Windows 10/11
- install and start [Visual Studio Code](https://code.visualstudio.com/download)
- install git (`Ctrl-Shift-G`, `Download Git for Windows`), download, install (make sure to install `Git Bash` as well), restart `Visual Studio Code`
- clone [this repository](https://github.com/cables-gl/cables_dev) from GitHub (`Ctrl-Shift-G`, `Clone Repository`, `Clone from GitHub`)
- open new terminal (``Ctrl-Shift-` ``), make sure it's `Git Bash`, not `PowerShell`
- make sure you have a profile file for your shell `touch ~/.bash_profile`
- continue [below](#common)

### Common
- install [Node Version Manager](https://github.com/nvm-sh/nvm#install--update-script)
- close and reopen your terminal, make sure nvm is installed properly, `nvm --version` should output some version number
- run `./install_local.sh`
  - this will:
    - install the required node version (and set it as default in `nvm`)
    - check out all needed repositories into subdirectories
    - `npm install` all dependencies
    - `npm run build` in all repositories
- IMPORTANT: make sure your current shell has the proper node version by running `node --version` before the next step
  - if not, open a new terminal before you start the server, and check again
- change directory to `cables_electron/`
- continue with the [cables electron](https://github.com/cables-gl/cables_electron/blob/develop/README.md#Development) development steps
- if you forked any of the above repos, check out [how to work with forks](docs/howto_working_with_forks.md)

## Scripts

### build_all.sh

enters all repositories and runs `npm run build`

### install_local.sh

tries to guess your OS, installs dependencies, creates needed directories and files and copies
`cables_example.json` to `cables.json` if it does not exist

### update_repos.sh

reads the current nodeversion vom .nvmrc and walks the repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm if there
are changes in the remore repositories.

if given a branch, like `update_repos.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

if given `force` as a first parameter, like `update_repos.sh force`, will rebuild with npm,
even if there are no changes in git.

### update_ops.sh

* intended for community devenv only
* updates patchops/userops/teamops/extensionops
* repositories need to be checked out to cables/src/ops/users, cables/ops/teams, ...
* pulls `master` and `main` for all repositories
* runs `npm run opdocs` in cables_api to refresh caches

### update_live.sh

* intended for cables.gl only!
* makes sure wanted node version is installed
* makes sure all the repositories are on `master` branch
* pulls `master` for all repositories
* runs `npm` to build all the repositories
* on live: run `pm2 restart all` afterward!

## More...
- [howto changelog](docs/howto_changelog.md)
- [howto create_new_ops](docs/howto_create_new_ops.md)
- [howto op_new_version](docs/howto_op_new_version.md)
- [howto jsdoc](docs/howto_jsdoc.md)
- [howto libraries](docs/howto_libraries.md)
- [install community devenv](https://github.com/undev-studio/cables_api/blob/develop/docs/install.md)
