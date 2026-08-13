import path from "path";
import fs from "fs";
import jsonfile from "jsonfile";
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
 * @property {boolean|null} [clean=false]
 */

/**
 * @typedef {Object} CablesWebpackConfig
 * @property {string} [mode="production"]
 * @property {string} entry
 * @property {object} output
 * @property {string} output.path
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

    const patchFile = config.entry;
    const patchJson = jsonfile.readFileSync(patchFile);

    const coreConfig = webpackConfigCore(config, patchJson, logger);
    const opsConfig = webpackOpsConfig(config, patchJson, logger);
    const depsConfigs = webpackOpDependenciesConfig(config, patchJson, logger);
    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) =>
    {
        depsConfigNames.push(depsConfig.name);
    });
    const assetsConfig = webpackAssetsConfig(config, patchJson, logger);
    const filesConfig = webpackPatchFilesConfig(config, patchJson, logger);
    const jsonConfig = webpackPatchJsonConfig(config, patchJson, logger);
    const minifyConfig = webpackMinifyConfig(config, patchJson, logger);
    minifyConfig.dependencies = [coreConfig.name, opsConfig.name, jsonConfig.name, ...depsConfigNames];
    const combineConfig = webpackCombineConfig(config, patchJson, logger);
    combineConfig.dependencies = [minifyConfig.name];
    const htmlConfig = webpackHtmlConfig(config, patchJson, logger);
    htmlConfig.dependencies = [assetsConfig.name, filesConfig.name, combineConfig.name];
    return [
        coreConfig,
        opsConfig,
        ...depsConfigs,
        assetsConfig,
        filesConfig,
        jsonConfig,
        minifyConfig,
        combineConfig,
        htmlConfig,
    ];

};
