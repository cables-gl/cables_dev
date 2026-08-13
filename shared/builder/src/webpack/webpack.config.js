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
 * @property {boolean} combinejs
 * @property {boolean} flat
 * @property {boolean} minify
 * @property {boolean} sourcemaps
 * @property {boolean} minifyglsl
 * @property {boolean} clean
 * @property {boolean} indexHtml
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
    const targetDir = config.output.path;
    const options = config.options;
    const sourceDir = path.resolve(path.dirname(patchFile));

    const patchJson = jsonfile.readFileSync(patchFile);
    fs.mkdirSync(targetDir, { "recursive": true });

    const buildMode = config.mode;
    const combineJs = options.combinejs;
    const flat = options.flat;
    const minify = options.minify;
    const sourceMap = options.sourcemaps;
    const minifyGlsl = options.minifyglsl;
    const clean = options.clean;
    const indexHtml = options.indexHtml;

    const coreConfig = webpackConfigCore(patchJson, sourceDir, path.join(targetDir, "js"), buildMode, logger);
    const opsConfig = webpackOpsConfig(patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), buildMode, minifyGlsl, combineJs, logger);
    const depsConfigs = webpackOpDependenciesConfig(patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), buildMode, logger);
    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) =>
    {
        depsConfigNames.push(depsConfig.name);
    });
    const assetsConfig = webpackAssetsConfig(patchJson, path.join(sourceDir, "assets"), path.join(targetDir, "assets"), buildMode, logger);
    const filesConfig = webpackPatchFilesConfig(patchJson, sourceDir, targetDir, buildMode, logger);
    const jsonConfig = webpackPatchJsonConfig(patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, flat, logger);
    const minifyConfig = webpackMinifyConfig(patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, flat, minify, sourceMap, logger);
    minifyConfig.dependencies = [coreConfig.name, opsConfig.name, jsonConfig.name, ...depsConfigNames];
    const combineConfig = webpackCombineConfig(patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, clean, logger);
    combineConfig.dependencies = [minifyConfig.name];
    const htmlConfig = webpackHtmlConfig(patchJson, sourceDir, targetDir, buildMode, combineJs, flat, indexHtml, logger);
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
