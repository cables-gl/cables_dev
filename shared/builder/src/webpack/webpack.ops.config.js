import path from "path";
import fs from "fs";
import webpack from "webpack";
import { fileURLToPath } from "url";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;
    const buildUtil = new BuildUtil(logger);
    logger.info("assembling ops");

    const targetDir = CablesWebpackHelper.getJsDir(config);
    const buildMode = config.mode || "production";
    const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;
    const minifyGlsl = config.options?.hasOwnProperty("minifyglsl") ? config.options.minifyglsl : true;
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const usedOps = CablesWebpackHelper.getOps();
    const opNames = usedOps.map((op) => { return op.name; });
    const opFiles = usedOps.map((op) => { return path.join(op.dir, op.name + ".js"); });

    let plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": false,
            "raw": true,
            "banner": () =>
            {
                let banner = "\"use strict\";\n\n";
                banner += "var CABLES=CABLES||{};\n";
                banner += "CABLES.OPS=CABLES.OPS||{};\n\n";
                banner += "var Ops=Ops || {};\n";
                let namespaces = [];
                opNames.forEach((opName) =>
                {
                    const parts = opName.split(".");
                    for (let k = 1; k < parts.length; k++)
                    {
                        let partPartname = "";
                        for (let j = 0; j < k; j++) partPartname += parts[j] + ".";

                        partPartname = partPartname.substr(0, partPartname.length - 1);
                        namespaces.push(partPartname);

                    }
                });
                namespaces = [...new Set(namespaces)];
                namespaces.sort((a, b) => { return a.localeCompare(b); });
                namespaces.forEach((namespace) =>
                {
                    banner += namespace + "=" + namespace + "|| {};\n";
                });
                return banner;
            }
        })
    ];

    if (!combineJs)
    {
        plugins.push(new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": () => { return buildUtil.getJsLoadedCode(); }
        }));
    }

    // like the web export, asset paths and op ids are replaced in the whole op code, not per op, so cached op modules stay valid
    plugins.push({
        "apply": function (compiler)
        {
            compiler.hooks.thisCompilation.tap("CablesWebpackOpsReplacements", (compilation) =>
            {
                compilation.hooks.processAssets.tap({
                    "name": "CablesWebpackOpsReplacements",
                    "stage": webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
                }, () =>
                {
                    const asset = compilation.getAsset("ops.js");
                    if (!asset) return;
                    let source = asset.source;
                    [CablesWebpackHelper.getAssetReplacements(), CablesWebpackHelper.getOpIdReplacements()].forEach((replacements) =>
                    {
                        const keys = Object.keys(replacements).sort((a, b) => { return b.length - a.length; });
                        if (keys.length === 0) return;
                        const regExp = new RegExp(keys.map((key) => { return key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|"), "g");
                        const code = source.source().toString();
                        const replaced = new webpack.sources.ReplaceSource(source);
                        for (const match of code.matchAll(regExp))
                        {
                            replaced.replace(match.index, match.index + match[0].length - 1, replacements[match[0]]);
                        }
                        source = replaced;
                    });
                    compilation.updateAsset("ops.js", source);
                });
            });
        }
    });

    if (config.plugins?.ops) plugins = plugins.concat(config.plugins.ops);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "ops",
        "devtool": (minify && config.options?.sourcemaps) ? "source-map" : false,
        // size depends on the ops used in the patch, warn only for very big patches
        "performance": {
            "maxAssetSize": 10 * 1024 * 1024,
            "maxEntrypointSize": 10 * 1024 * 1024
        },
        "mode": buildMode,
        "entry": opFiles,
        "output": {
            "path": targetDir,
            "filename": "ops.js"
        },
        "optimization": {
            "concatenateModules": true,
            "usedExports": true,
            "minimize": minify
        },
        "module": {
            "rules": [
                { "sideEffects": false },
                {
                    "test": /\.js/,
                    "use": {
                        "loader": path.resolve(path.join(__dirname, "./webpack.op.loader.js")),
                        "options": {
                            "minifyGlsl": minifyGlsl
                        }
                    }
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "plugins": plugins
    };

    if (config.overrides?.ops) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.ops);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
