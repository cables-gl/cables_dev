import path from "path";
import fs from "fs";
import webpack from "webpack";
import { fileURLToPath } from "url";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling core");

    const targetDir = path.join(config.output.path, "js");
    const buildMode = config.mode || "production";

    fs.mkdirSync(targetDir, { "recursive": true });

    const __coreDir = config.options?.coreDir || path.resolve(path.dirname(fileURLToPath(import.meta.resolve("cables/package.json"))));
    const __devDir = config.options?.devDir || path.dirname(fileURLToPath(import.meta.resolve("cables_dev/package.json")));

    let plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": "\n\nvar CABLES = CABLES || {};" // FIXME: buildInfo?
        }),
    ];

    if (config.plugins?.core) plugins = plugins.concat(config.plugins.core);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let result = {
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
        },
        "resolve": {
            "alias": {
                "cables-shared-client": path.resolve(
                    __devDir,
                    "shared/client"
                )
            }
        },
    };

    if (config.overrides?.core) result = { ...result, ...config.overrides.core };
    if (config.overrides?.all) result = { ...result, ...config.overrides.all };

    return result;
};
