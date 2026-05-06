import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl) =>
{
    command.log.info("assembling assets");

    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        new CopyPlugin({
            "patterns": [sourceDir],
        }),
    ];

    return {
        "name": "assets",
        "mode": isLiveBuild ? "production" : "development",
        "devtool": minify ? "source-map" : sourceMap,
        "plugins": plugins,
        "output": {
            "path": targetDir,
        },
    };
};
