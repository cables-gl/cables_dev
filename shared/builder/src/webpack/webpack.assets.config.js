import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";

export default (patchJson, sourceDir, targetDir, isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl) =>
{
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
