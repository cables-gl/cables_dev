import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl) =>
{

    command.log.info("assembling patchjson");

    fs.mkdirSync(targetDir, { "recursive": true });

    let jsonFileName = null;
    const patchFiles = fs.readdirSync(sourceDir);
    patchFiles.forEach((file) => {
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
                compiler.hooks.thisCompilation.tap("CablesWebpackPatchJsonPlugin", compilation =>
                {
                    compilation.hooks.processAssets.tap({
                            name: "CablesWebpackPatchJsonPlugin",
                            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                        }, () =>
                        {
                            const exportable = CablesWebpackHelper.makeExportable(patchJson, [], finalAssetPath);
                            compilation.emitAsset(
                                jsonFileName,
                                new webpack.sources.RawSource(JSON.stringify(exportable, null, 4)),
                            );
                        },
                    );
                });
            }
        }
    ];

    return {
        "name": "patchjson",
        "mode": isLiveBuild ? "production" : "development",
        "entry": {},
        "output": {
            "path": targetDir
        },
        "devtool": minify ? "source-map" : sourceMap,
        "plugins": plugins
    };
};
