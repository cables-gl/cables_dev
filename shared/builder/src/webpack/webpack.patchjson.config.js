import path from "path";
import fs from "fs";
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
    logger.info("assembling patchjson");

    const patchFile = config.entry;
    const targetDir = CablesWebpackHelper.getJsDir(config);
    const sourceDir = path.resolve(path.dirname(patchFile));
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const jsonFileName = CablesWebpackHelper.getJsonFileName(config);

    let plugins = [
        {
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackPatchJsonPlugin", (compilation) =>
                {
                    compilation.hooks.processAssets.tap({
                        "name": "CablesWebpackPatchJsonPlugin",
                        "stage": webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                    }, () =>
                    {
                        let exportable = CablesWebpackHelper.makeExportable(patchJson, []);
                        const replacements = CablesWebpackHelper.getAssetReplacements();
                        exportable.ops.forEach((op) =>
                        {
                            if (!op.portsIn) return;
                            op.portsIn.forEach((port) =>
                            {
                                if (port.display === "file" && replacements.hasOwnProperty(port.value)) port.value = replacements[port.value];
                            });
                        });
                        exportable = JSON.stringify(exportable, null, minify ? 0 : 4);
                        compilation.emitAsset(
                            jsonFileName,
                            new webpack.sources.RawSource(exportable)
                        );
                    }
                    );
                });
            }
        },
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.patchjson) plugins = plugins.concat(config.plugins.patchjson);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "patchjson",
        "performance": {
            "hints": false
        },
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir
        },
        "plugins": plugins,
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
    if (config.overrides?.patchjson) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.patchjson);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
