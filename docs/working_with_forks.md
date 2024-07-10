# forks

if you forked one or more of the cables repositories, create a `.env` file in `cables_dev`
and set one, or more, of the following variables to your repo urls, then run `update_repos.sh` (again):

```shell
CABLES_DEV_REPO="git@github.com:cables-gl/cables_dev.git"
CABLES_CORE_REPO="git@github.com:cables-gl/cables.git"
CABLES_UI_REPO="git@github.com:cables-gl/cables_ui.git"
CABLES_ELECTRON_REPO="git@github.com:cables-gl/cables_electron.git"
```
