import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";
import TerserPlugin from "terser-webpack-plugin";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean) =>
{
    command.log.info("minify js");
    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [];
    return {
        "name": "minify",
        "mode": isLiveBuild ? "production" : "development",
        "entry": [
            path.join(targetDir, "js", "patch.js")
        ],
        "output": {
            "path": targetDir,
            "filename": "min.js"
        },
        "devtool": minify ? "source-map" : sourceMap,
        "plugins": plugins,
        "optimization": {
            "minimizer": [
                new TerserPlugin({
                    "extractComments": false,
                    "terserOptions": { "output": { "comments": false } },
                })],
            "minimize": minify,
        },

    };
};
