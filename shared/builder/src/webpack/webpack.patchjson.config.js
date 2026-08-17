import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{

    if (!logger) logger = console;
    logger.info("assembling patchjson");

    const patchFile = config.entry;
    const targetDir = path.join(config.output.path, "js");
    const sourceDir = path.resolve(path.dirname(patchFile));
    const buildMode = config.mode || "production";
    const flat = config.options?.hasOwnProperty("flat") ? config.options.flat : false;
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    let jsonFileName = path.basename(config.entry, ".cables") + ".json";
    let finalAssetPath = "assets/";
    if (flat) finalAssetPath = "";

    let plugins = [
        {
            apply(compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackPatchJsonPlugin", (compilation) =>
                {
                    compilation.hooks.processAssets.tap({
                        "name": "CablesWebpackPatchJsonPlugin",
                        "stage": webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                    }, () =>
                    {
                        const exportable = CablesWebpackHelper.makeExportable(patchJson, []);
                        compilation.emitAsset(
                            jsonFileName,
                            new webpack.sources.RawSource(JSON.stringify(exportable, null, 4)),
                        );
                    },
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
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir,
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
    if (config.overrides?.patchjson) buildConfig = { ...buildConfig, ...config.overrides.patchjson };
    if (config.overrides?.all) buildConfig = { ...buildConfig, ...config.overrides.all };

    return buildConfig;
};
