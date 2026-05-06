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

export default (command, patchJson, sourceDir, targetDir, isLiveBuild = false, combineJs = false, flat = false, minify = false, sourceMap = false, minifyGlsl = false, clean = false) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const coreConfig = webpackConfigCore(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const opsConfig = webpackOpsConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const depsConfigs = webpackOpDependenciesConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) => {
        depsConfigNames.push(depsConfig.name);
    });
    const assetsConfig = webpackAssetsConfig(command, patchJson, path.join(sourceDir, "assets"), path.join(targetDir, "assets"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const filesConfig = webpackPatchFilesConfig(command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const jsonConfig = webpackPatchJsonConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    const minifyConfig = webpackMinifyConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    minifyConfig.dependencies = [coreConfig.name, opsConfig.name, jsonConfig.name, ...depsConfigNames];
    const combineConfig = webpackCombineConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
    combineConfig.dependencies = [minifyConfig.name];
    const htmlConfig = webpackHtmlConfig(command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, false, sourceMap, minifyGlsl, clean);
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
