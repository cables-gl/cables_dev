# cables development environment

## structure

cables development is spread across for git-repositories

### [cables_dev](https://github.com/cables-gl/cables_dev)

### [cables](https://github.com/cables-gl/cables)

### [cables_ui](https://github.com/cables-gl/cables_ui)

### [cables_electron](https://github.com/cables-gl/cables_electron)

## set up local environment (for standalone version)

### mac/linux
- install [git](https://github.com/git-guides/install-git)
- clone [this repository](https://github.com/cables-gl/cables_dev)
- change into the checked out directory (`cd cables_dev/`)
- continue [below](#common)

### windows 11
- install and start [Visual Studio Code](https://code.visualstudio.com/download)
- install git (`Ctrl-Shift-G`, `Download Git for Windows`), download, install (make sure to install `Git Bash` as well), restart `Visual Studio Code`
- clone [this repository](https://github.com/cables-gl/cables_dev) from GitHub (`Ctrl-Shift-G`, `Clone Repository`, `Clone from GitHub`)
- open new terminal (``Ctrl-Shift-` ``), make sure it's `Git Bash`, not `PowerShell`
- make sure you have a profile file for your shell `touch ~/.bash_profile`
- continue [below](#common)

### common
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
- run `npm run build`
- use `npm run start` to start the app
  - this will start watchers for changes in clientside javascript dirs (e.g. `src_client` and `../shared/client/`
  - if you make changes to files in this directory, a reload of the electron app is enough to see the changes (cmd/ctrl+r)
- if you want to develop on ops and/or the ui, change to cables_dev (`cd ..`) and run `npm run start:standalone`
  - this will create watchers on files in `cables` and `cables_ui` that trigger a rebuild on change
  - to pick up on these changes, change your `cables_env_local.json` to point to these folders:
    - `"path.uiDist": "../../cables_ui/dist/"`
    - `"path.ops": "../../cables/src/ops/"`

## more...
- [api_best_practices](docs/api_best_practices.md)
- [howto changelog](docs/howto_changelog.md)
- [howto create_new_ops](docs/howto_create_new_ops.md)
- [howto op_new_version](docs/howto_op_new_version.md)
- [howto jsdoc](docs/howto_jsdoc.md)
- [howto libaries](docs/howto_libraries.md)
- [install community devenv](docs/install.md)
