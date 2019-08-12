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


# visual studio code

* install extensions: `Editorconfig`, `Eslint`, `Prettier - Code Formatter`
* additional extensions to install (e.g for ES6 syntax highlighting): `Babel Javascript`
* to make eslint work properly, please add the following to your `*.code-workspace` under `settings` or in your user settings:

```json
        "editor.formatOnSave": false,
        "editor.formatOnSaveTimeout": 1000,
        "eslint.autoFixOnSave": false,
        "eslint.alwaysShowStatus": true,
        "files.autoSave": "off",
        "eslint.enable": true,
        "editor.autoIndent": false,
        "prettier.eslintIntegration": true,
        "typescript.validate.enable": false,
        "javascript.format.enable": false,
        "prettier.tabWidth": 4,
        "search.useIgnoreFiles": false,
        "search.exclude": {
            "**/node_modules": true,
            "**/bower_components": true
        }
```
The `search.exclude` and `search.useIgnoreFiles` should be set like this so you are able to still search the files on VSCode (it ignores all folders that are in `.gitignore` by default).
* Have fun!
