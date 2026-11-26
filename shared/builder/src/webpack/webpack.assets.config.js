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
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    let plugins = [];
    if (fs.existsSync(sourceDir))
    {
        fs.mkdirSync(targetDir, { "recursive": true });

        plugins = [
            new CopyPlugin({
                "patterns": [sourceDir],
            }),
            CablesWebpackHelper.removeEmptyChunk()
        ];

        if (config.plugins?.assets) plugins = plugins.concat(config.plugins.assets);
        if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);
    }

    let buildConfig = {
        "name": "assets",
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

    if (config.overrides?.assets) buildConfig = { ...buildConfig, ...config.overrides.assets };
    if (config.overrides?.all) buildConfig = { ...buildConfig, ...config.overrides.all };

    return buildConfig;
};
