## get exe-export-templates
- repo: https://github.com/cables-gl/cables-exe-export/
- needs `git lfs` https://git-lfs.com/ to get around filesize-restrictions on github
  - install git lfs (i.e. `brew install git-lfs`)
  - do `git lfs install` (once per user/account)
  - check out the above repo

## update exe-export
- checkout above repo
- put new files in appropriate directory
- push to develop/master
- hook_exe_export.sh should run via webhook

## local electron/exe export
* download electron for the supported platforms from https://github.com/electron/electron/releases
* put them into a subdirectory of this current directory named `electron/win32-x64`, currently supported:
    * win32-x64
    * linux-x64
    * darwin-x64
    * darwin-arm64
* update `paths.electron` in `cables.json` with the proper (relative) directory path


