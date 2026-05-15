import path from "path";
import fs from "fs";
import webpackConfigCore from "./webpack.core.config.js";
import webpackOpsConfig from "./webpack.ops.config.js";
import webpackHtmlConfig from "./webpack.html.config.js";
import webpackAssetsConfig from "./webpack.assets.config.js";
import webpackPatchFilesConfig from "./webpack.patchfiles.config.js";
import webpackPatchJsonConfig from "./webpack.patchjson.config.js";
import webpackOpDependenciesConfig from "./webpack.dependencies.config.js";
import webpackCombineConfig from "./webpack.combine.config.js";
import webpackMinifyConfig from "./webpack.minify.config.js";

/** @typedef {import("../build.js").CablesBuildOptions} CablesBuildOptions */

/**
 * @param {CablesModule} command
 * @param {any} patchJson
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {CablesBuildOptions} options
 * @return {*[]}
 */
export default (command, patchJson, sourceDir, targetDir, options) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const buildMode = options.buildMode;
    const combineJs = options.combinejs;
    const flat = options.flat;
    const minify = options.minify;
    const sourceMap = options.sourcemaps;
    const minifyGlsl = options.minifyglsl;
    const clean = options.clean;
    const indexHtml = options.indexHtml;

    const coreConfig = webpackConfigCore(command, patchJson, sourceDir, path.join(targetDir, "js"), buildMode);
    const opsConfig = webpackOpsConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), buildMode, minifyGlsl);
    const depsConfigs = webpackOpDependenciesConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), buildMode);
    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) =>
    {
        depsConfigNames.push(depsConfig.name);
    });
    const assetsConfig = webpackAssetsConfig(command, patchJson, path.join(sourceDir, "assets"), path.join(targetDir, "assets"), buildMode);
    const filesConfig = webpackPatchFilesConfig(command, patchJson, sourceDir, targetDir, buildMode);
    const jsonConfig = webpackPatchJsonConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, flat);
    const minifyConfig = webpackMinifyConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, flat, minify, sourceMap);
    minifyConfig.dependencies = [coreConfig.name, opsConfig.name, jsonConfig.name, ...depsConfigNames];
    const combineConfig = webpackCombineConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), buildMode, combineJs, clean);
    combineConfig.dependencies = [minifyConfig.name];
    const htmlConfig = webpackHtmlConfig(command, patchJson, sourceDir, targetDir, buildMode, combineJs, flat, indexHtml);
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
