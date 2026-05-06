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

export default (command, patchJson, sourceDir, targetDir, isLiveBuild = false, combineJs = false, flat = false, minify = false, sourceMap = false, minifyGlsl = false, clean = false) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const core = webpackConfigCore(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const ops = webpackOpsConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const deps = webpackOpDependenciesConfig(command, patchJson, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const assets = webpackAssetsConfig(command, patchJson, path.join(sourceDir, "assets"), path.join(targetDir, "assets"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const files = webpackPatchFilesConfig(command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const json = webpackPatchJsonConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    const combine = webpackCombineConfig(command, patchJson, sourceDir, path.join(targetDir, "js"), isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    combine.dependencies = [core.name, ops.name, json.name];
    const html = webpackHtmlConfig(command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean);
    html.dependencies = [assets.name, files.name, combine.name];
    return [
        core,
        ops,
        ...deps,
        assets,
        files,
        json,
        combine,
        html,
    ];

};
