import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import fs from "fs";

export default (command, patchJson, sourceDir, targetDir, buildMode) =>
{
    command.log.info("assembling patchfiles");

    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        new CopyPlugin({
            "patterns": [
                path.resolve(path.join(sourceDir, "LICENCE")),
                path.resolve(path.join(sourceDir, "screenshot.png")),
                path.resolve(path.join(sourceDir, "cables.txt")),
                path.resolve(path.join(sourceDir, "credits.txt")),
                path.resolve(path.join(sourceDir, "legal.txt")),
                path.resolve(path.join(sourceDir, "doc.md")),
            ],
        }),
    ];

    return {
        "name": "files",
        "mode": buildMode,
        "plugins": plugins,
        "output": {
            "path": targetDir,
        },
    };
};
