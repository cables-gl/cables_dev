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

    fs.mkdirSync(targetDir, { "recursive": true });

    let jsonFileName = null;
    const patchFiles = fs.readdirSync(sourceDir);
    patchFiles.forEach((file) =>
    {
        if (path.basename(file).endsWith(".cables"))
        {
            jsonFileName = path.basename(file, ".cables") + ".json";
        }
    });

    let finalAssetPath = "assets/";
    if (flat) finalAssetPath = "";

    const plugins = [
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

    return {
        "name": "patchjson",
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir,
        },
        "plugins": plugins,
        "module": {
            "rules": [
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        }
    };
};
