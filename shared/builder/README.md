# cables builder

```
   _ ____       ________  ___________             ______      ______
._(//   /   ___)\_     /(_\___      /(___        /     /     /     /
|     _/___)\ _  /        _  /          /______)/    _/(___ /     /(_____..___
|_    \/      / _         /_/    _/   _//      /    _)     / ____        ||  //
 /          _/  /        /_\     \    \(      /     \    _/   _ /       _||_/
/___________)__/        __________\____________\______       \\/________)diP
- ------------/________/------------------------------\_______\------------- -

```

A set of webpack configs to build a cables [patch export](https://cables.gl/docs/4_export_embed/dev_embed/export_standalone/export_standalone)
into a html website with webpack, like the "html" export on [cables.gl](https://cables.gl).

## Usage

Install it next to webpack in your project:

```
npm install --save-dev @cables/builder webpack webpack-cli
```

Create a `webpack.config.js`:

```js
import cablesBuildConfig from "@cables/builder/webpack";

export default () => {
    return cablesBuildConfig({
        mode: "production",
        entry: "./export", // folder containing one .cables file, or directly point to the .cables file
        output: {
            path: "./build",
        },
        options: {
            minify: true,
            combinejs: true,
        },
    });
};
```

Then run `npx webpack`.

The ops used in the patch have to be in the `ops/` folder next to the `.cables` file. see below for other options.
You can export you patch for building using [cables-cli](https://github.com/cables-gl/cables-cli), or check the "Buildable" option
in the export tab on [cables.gl](https://cables.gl):

```
cables export -t patch --buildable -d ./export -p PATCHID
```

The export will contain `_build/` with the core, libs and corelibs of the patch as well as a `package.json` and `webpack.config.js` to build it into `_build/dist`:

```
cd export/_build
npm install
npm run build
```

### Config

All keys with their defaults, only `entry` and `output.path` are required:

```js
cablesBuildConfig({
    mode: "production", // webpack mode
    entry: "./export", // the export folder, or the .cables file in it
    output: {
        path: "./build", // target folder of the build
    },
    options: {
        type: "html", // "html" or "headless"

        // see export options of cables-cli
        index: true,
        jsonfilename: undefined,
        combinejs: true,
        flat: false,
        assets: "auto",
        minify: true,
        sourcemaps: false,
        minifyglsl: true,

        // build
        loglevel: "info", // "error", "warn", "info", "verbose" or "debug"
        clean: false, // remove the output folder before building

        // code lookup
        opsDirs: [], // additional op directories
        coreFile: "_build/cables.js",
        coreDir: undefined, // local dir of the cables repository to build core and corelibs from
        libsDir: "_build/libs", // folder with the libs ops are using
        corelibsDir: "_build/corelibs", // folder with corelibs (<name>.js)
        assetLibraryDir: undefined, // folder of the asset library
        devDir: undefined, // checkout of cables_dev
    },
    // additional webpack plugins per build-step
    // steps are:
    //  all, core, ops, dependencies, assets, files, patchjson, combine, minify, html, headless
    plugins: {
        all: [],
    },
    // webpack config values to override per build step, same steps as above
    overrides: {
        all: {},
    },
});
```

## Development (in cables_dev/shared/builder)

`webpack.config.js` in this folder is a dev config.

to use the example config to build into ../../gen/build

```
cables export -t patch --allops -d ../../gen/export PATCHID
npm run build
```
