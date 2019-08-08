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
npm i
cd ..
cd cables_ui
npm i
cd ..
```

start cables: `npm run start`


# visual studio code
* install extensions: `Editorconfig`, `Eslint`, `Prettier - Code Formatter`
* additional extensions to install (e.g for ES6 syntax highlighting): `Babel Javascript`
* to make eslint work properly, please add the following to your *.code-workspace under `settings` or in your user settings:

```json
    "editor.formatOnSave": false,
    "editor.formatOnSaveTimeout": 1000,
    "eslint.autoFixOnSave": false,
    "eslint.alwaysShowStatus": true,
    "files.autoSave": "off",
    // "editor.formatOnSave": true,
    // "editor.formatOnType": true,
    // "eslint.autoFixOnSave": true,
    "eslint.enable": true,
    "prettier.singleQuote": true,
    "editor.autoIndent": false,
    "prettier.eslintIntegration": true,
    "typescript.validate.enable": false,
    "prettier.tabWidth": 4
    ```
* Have fun!
