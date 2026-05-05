import path from "path";
import fs from "fs";
import webpackConfigCore from "./webpack.core.config.js";
import webpackOpsConfig from "./webpack.ops.config.js";
import webpackHtmlConfig from "./webpack.html.config.js";
import webpackAssetsConfig from "./webpack.assets.config.js";
import webpackPatchFilesConfig from "./webpack.patchfiles.config.js";
import webpackPatchJsonConfig from "./webpack.patchjson.config.js";
import webpackOpDependenciesConfig from "./webpack.dependencies.config.js";

export default (patchFile, sourceDir, targetDir, isLiveBuild = false, combinejs = false, flat = false, minify = false, sourceMap = false, minifyGlsl = false) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const core = webpackConfigCore(patchFile, sourceDir, path.join(targetDir, "js"), isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const ops = webpackOpsConfig(patchFile, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const deps = webpackOpDependenciesConfig(patchFile, path.join(sourceDir, "ops"), path.join(targetDir, "js"), isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const assets = webpackAssetsConfig(patchFile, path.join(sourceDir, "assets"), path.join(targetDir, "assets"), isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const files = webpackPatchFilesConfig(patchFile, sourceDir, targetDir, isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const json = webpackPatchJsonConfig(patchFile, sourceDir, path.join(targetDir, "js"), isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    const html = webpackHtmlConfig(patchFile, sourceDir, targetDir, isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl);
    html.dependencies = ["core", "ops", "assets", "files", "json"];
    return [
        core,
        ops,
        ...deps,
        assets,
        files,
        json,
        html,
    ];
};
