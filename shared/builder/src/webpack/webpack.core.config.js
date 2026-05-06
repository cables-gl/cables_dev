import path from "path";
import fs from "fs";
import webpack from "webpack";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl) =>
{
    command.log.info("assembling core");

    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const __coreDir = path.join(__dirname, ".." , "..", "node_modules" , "cables");

    const plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": "\n\nvar CABLES = CABLES || {};" // FIXME: buildInfo?
        })
    ];
    return {
        "name": "core",
        "mode": isLiveBuild ? "production" : "development",
        "entry": [
            path.join(__coreDir, "src", "core", "index.js")
        ],
        "devtool": minify ? "source-map" : sourceMap,
        "output": {
            "path": targetDir,
            "filename": "cables.js",
            "library": {
                "name": "CABLES",
                "type": "assign-properties"
            }
        },
        "optimization": {
            "concatenateModules": true,
            "minimizer": [new TerserPlugin({
                "extractComments": false,
                "terserOptions": { "output": { "comments": false } }
            })],
            "minimize": minify,
            "usedExports": true
        },
        "module": {
            "rules": [
                { "sideEffects": false },
                {
                    "test": /\.frag/,
                    "use": "raw-loader"
                },
                {
                    "test": /\.vert/,
                    "use": "raw-loader"
                },
                {
                    "test": /\.wgsl/,
                    "use": "raw-loader"
                }
            ].filter(Boolean)
        },
        "plugins": plugins
    };
};
