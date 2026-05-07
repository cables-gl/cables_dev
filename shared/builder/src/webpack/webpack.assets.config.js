import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";

export default (command, patchJson, sourceDir, targetDir, buildMode) =>
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
        "mode": buildMode,
        "plugins": plugins,
        "output": {
            "path": targetDir,
        },
    };
};
