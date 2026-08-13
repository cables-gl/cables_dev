import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";
import path from "path";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling assets");

    const patchFile = config.entry;
    const sourceDir = path.join(path.resolve(path.dirname(patchFile)), "assets");
    const targetDir = path.join(config.output.path, "assets");
    const buildMode = config.mode || "production";

    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        new CopyPlugin({
            "patterns": [sourceDir],
        }),
        CablesWebpackHelper.removeEmptyChunk()
    ];

    return {
        "name": "assets",
        "mode": buildMode,
        "entry": patchFile,
        "plugins": plugins,
        "output": {
            "path": targetDir
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
};
