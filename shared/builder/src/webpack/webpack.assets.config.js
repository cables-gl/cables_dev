import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";

export default (patchJson, sourceDir, targetDir, buildMode, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling assets");

    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        new CopyPlugin({
            "patterns": [sourceDir],
        }),
    ];

    return {
        "name": "assets",
        "mode": buildMode,
        "plugins": plugins,
        "output": {
            "path": targetDir,
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
