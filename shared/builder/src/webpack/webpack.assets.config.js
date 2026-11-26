import fs from "fs";
import path from "path";
import { glob } from "glob";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;
    logger.info("assembling assets");

    const patchFile = config.entry;
    const sourceDir = path.join(path.resolve(path.dirname(patchFile)), "assets");
    const targetDir = CablesWebpackHelper.getAssetDir(config);
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;
    const assetsMode = config.options?.assets || "auto";

    const warnings = CablesWebpackHelper.getAssetWarnings();

    /** @type {{from: String, to: String}[]} */
    let patterns = [];
    if (assetsMode !== "none") patterns = [...CablesWebpackHelper.getAssetFiles()];
    if (fs.existsSync(sourceDir) && assetsMode === "all")
    {
        const usedSources = patterns.map((pattern) => { return pattern.from; });
        const usedNames = patterns.map((pattern) => { return pattern.to; });
        const allFiles = glob.sync(path.join(sourceDir, "**", "*"), { "nodir": true, "windowsPathsNoEscape": true, "ignore": path.join(sourceDir, "library", "**") });
        allFiles.forEach((file) =>
        {
            const name = path.relative(sourceDir, file).split(path.sep).join("_");
            if (usedSources.includes(file) || usedNames.includes(name)) return;
            usedNames.push(name);
            patterns.push({ "from": file, "to": name });
        });
    }

    /** @type {Object[]} */
    let plugins = [CablesWebpackHelper.removeEmptyChunk()];
    if (patterns.length > 0)
    {
        fs.mkdirSync(targetDir, { "recursive": true });

        // copy directly instead of emitting through webpack, assets can be hundreds of MB
        plugins.push(
            {
                "apply": function (compiler)
                {
                    compiler.hooks.afterEmit.tapPromise("CablesWebpackCopyAssets", async () =>
                    {
                        await Promise.all(patterns.map(async (pattern) =>
                        {
                            const target = path.join(targetDir, pattern.to);
                            await fs.promises.mkdir(path.dirname(target), { "recursive": true });
                            await fs.promises.copyFile(pattern.from, target);
                        }));
                        logger.info("copied " + patterns.length + " assets");
                    });
                }
            }
        );

        if (config.plugins?.assets) plugins = plugins.concat(config.plugins.assets);
        if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);
    }

    if (warnings.length > 0)
    {
        plugins.push({
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackAssetsWarnings", (compilation) =>
                {
                    warnings.forEach((warning) => { compilation.warnings.push(new webpack.WebpackError(warning)); });
                });
            }
        });
    }

    let buildConfig = {
        "name": "assets",
        "performance": {
            "hints": false
        },
        "mode": buildMode,
        "entry": patchFile,
        "plugins": plugins,
        "output": {
            "path": targetDir
        },
        "optimization": {
            "minimize": minify
        },
        "module": {
            "rules": [
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        }
    };

    if (config.overrides?.assets) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.assets);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
