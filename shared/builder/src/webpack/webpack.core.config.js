import path from "path";
import fs from "fs";
import webpack from "webpack";
import { fileURLToPath } from "url";

export default (patchJson, sourceDir, targetDir, buildMode, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling core");

    fs.mkdirSync(targetDir, { "recursive": true });

    const __coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.resolve("cables/package.json"))));

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
        "mode": buildMode,
        "entry": [
            path.join(__coreDir, "src", "core", "index.js")
        ],
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
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "plugins": plugins,
        "externals": {
            "socketcluster-client": "commonjs socketcluster-client",
            "jwt-encode": "commonjs socketcluster-client"

        }
    };
};
