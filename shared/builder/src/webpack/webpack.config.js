import path from "path";
import fs from "fs";
import jsonfile from "jsonfile";
import { glob } from "glob";
import webpackConfigCore from "./webpack.core.config.js";
import webpackOpsConfig from "./webpack.ops.config.js";
import webpackHtmlConfig from "./webpack.html.config.js";
import webpackAssetsConfig from "./webpack.assets.config.js";
import webpackPatchFilesConfig from "./webpack.patchfiles.config.js";
import webpackPatchJsonConfig from "./webpack.patchjson.config.js";
import webpackOpDependenciesConfig from "./webpack.dependencies.config.js";
import webpackCombineConfig from "./webpack.combine.config.js";
import webpackMinifyConfig from "./webpack.minify.config.js";

/**
 * @typedef {Object} CablesBuildOptions
 * @property {("html"|"patch"|"code")} [type="html"]
 * @property {string|null} [destination]
 * @property {boolean|null} [index=true]
 * @property {boolean|null} [extract=true]
 * @property {string|null} [jsonfilename]
 * @property {boolean|null} [combinejs=true]
 * @property {boolean|null} [dev=false]
 * @property {("auto"|"all"|"none")} [assets="auto"]
 * @property {boolean|null} [flat=false]
 * @property {boolean|null} [minify=true]
 * @property {boolean|null} [sourcemaps=false]
 * @property {boolean|null} [minifyglsl=false]
 */

/**
 * @typedef {Object} CablesWebpackConfig
 * @property {string} [mode="production"]
 * @property {string} entry
 * @property {object} output
 * @property {string} output.path
 * @property {Object} [plugins]
 * @property {array} [plugins.all]
 * @property {array} [plugins.core]
 * @property {array} [plugins.ops]
 * @property {array} [plugins.dependencies]
 * @property {array} [plugins.assets]
 * @property {array} [plugins.files]
 * @property {array} [plugins.patchjson]
 * @property {array} [plugins.minify]
 * @property {array} [plugins.combine]
 * @property {array} [plugins.html]
 * @property {Object} [overrides]
 * @property {Object} [overrides.all]
 * @property {Object} [overrides.core]
 * @property {Object} [overrides.ops]
 * @property {Object} [overrides.dependencies]
 * @property {Object} [overrides.assets]
 * @property {Object} [overrides.files]
 * @property {Object} [overrides.patchjson]
 * @property {Object} [overrides.minify]
 * @property {Object} [overrides.combine]
 * @property {Object} [overrides.html]
 * @property {CablesBuildOptions} [options]
 */
/**
 * @param {CablesWebpackConfig} config
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 * @return {*[]}
 */
export default (config, logger = null) =>
{

    if (!logger) logger = console;

    config.entry = path.resolve(config.entry);
    let patchFile = config.entry;
    const isDir = fs.lstatSync(config.entry).isDirectory();
    if (isDir)
    {
        const projectFileGlop = path.join(config.entry, "./*.cables");
        const projectFiles = glob.sync(projectFileGlop);
        if (!projectFiles.length)
        {
            throw new Error("no projectfile found in " + config.entry);
        }
        else if (projectFiles.length > 1)
        {
            let message = "multiple projectfiles found in " + config.entry + ":\n\n";
            projectFiles.forEach((file) =>
            {
                message += "    - " + file + "\n";
            });
            throw new Error(message);
        }
        else
        {
            patchFile = projectFiles[0];
            config.entry = patchFile;
        }
    }
    const patchJson = jsonfile.readFileSync(patchFile);

    const coreConfig = webpackConfigCore(config, patchJson, logger);
    const opsConfig = webpackOpsConfig(config, patchJson, logger);
    const depsConfigs = webpackOpDependenciesConfig(config, patchJson, logger);
    const assetsConfig = webpackAssetsConfig(config, patchJson, logger);
    const filesConfig = webpackPatchFilesConfig(config, patchJson, logger);
    const jsonConfig = webpackPatchJsonConfig(config, patchJson, logger);

    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) =>
    {
        depsConfigNames.push(depsConfig.name);
    });

    const combineConfig = webpackCombineConfig(config, patchJson, logger, depsConfigNames);
    const minifyConfig = webpackMinifyConfig(config, patchJson, logger, depsConfigNames);
    const htmlConfig = webpackHtmlConfig(config, patchJson, logger);

    return [
        coreConfig,
        opsConfig,
        ...depsConfigs,
        assetsConfig,
        filesConfig,
        jsonConfig,
        combineConfig,
        minifyConfig,
        htmlConfig
    ];

};
