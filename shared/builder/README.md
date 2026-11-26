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
into a standalone html export with webpack, like the "html" export on [cables.gl](https://cables.gl).

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

| key           | description                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`        | webpack mode, default `production`                                                                                                                              |
| `entry`       | the export folder, or the `.cables` file in it                                                                                                                  |
| `output.path` | target folder of the build                                                                                                                                      |
| `options`     | build options, see below                                                                                                                                        |
| `plugins`     | additional webpack plugins per build step (`core`, `ops`, `dependencies`, `assets`, `files`, `patchjson`, `combine`, `minify`, `html`) or for all steps (`all`) |
| `overrides`   | webpack config values to override per build step, same keys as `plugins`                                                                                        |

### Options

see [cables-cli](https://github.com/cables-gl/cables-cli) for export options, build-specific options are

| option        | default                              | description                                                                                                                                                |
| ------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`        | `html`                               | `html` or `headless`                                                                                                                                       |
| `loglevel`    | `info`                               | `error`, `warn`, `info`, `verbose` or `debug`, sets the webpack stats of every build step and the build log, `stats` in `overrides` take precedence        |
| `cache`       | `false`                              | `true` or a folder: keep a webpack filesystem cache between builds (default folder `node_modules/.cache/webpack`)                                          |
| `clean`       | `false`                              | remove the output folder before building, the build warns if it is not empty                                                                               |
| `opsDirs`     | `[]`                                 | more folders to look for ops in, after the `ops/` folder next to the `.cables` file                                                                        |
| `coreFile`    | `_build/cables.js` of a buildable export | an already built `cables.js` that is copied instead of building the core from `coreDir` |
| `coreDir`     | `cables/` in the cables_dev checkout | checkout of the [cables](https://github.com/cables-gl/cables) repository to build the core and corelibs from                                               |
| `libsDir`     | `_build/libs` of a buildable export, else `shared/libs` in `devDir` | folder with the libs ops can use |
| `corelibsDir` | `_build/corelibs` of a buildable export | folder with already built corelibs (`<name>.js`) that are copied instead of building them from `coreDir` |
| `devDir`      | the cables_dev checkout              | checkout of [cables_dev](https://github.com/cables-gl/cables_dev) for shared libs and client code, needed from npm unless `coreFile` and `libsDir` are set |

## Development (in cables_dev/shared/builder)

`webpack.config.js` in this folder is the dev config: it builds from the `cables` checkout and this
cables_dev repository and writes everything into `gen/` (ignored by git):

```
cables export -t patch --allops -d gen/export PATCHID
npm run build      # build into gen/build, bundle reports in gen/reports
npm run clean      # remove gen/
```
