import { createRequire } from "module";
import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";


// loaders are resolved from this package, not from the folder webpack runs in
const loaderPath = createRequire(import.meta.url).resolve;
/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;
    logger.info("assembling core");

    const targetDir = CablesWebpackHelper.getJsDir(config);
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    if (config.options?.coreFile)
    {
        const coreFile = path.resolve(config.options.coreFile);
        if (!fs.existsSync(coreFile)) throw new Error("coreFile not found: " + coreFile);
        const mapFile = coreFile + ".map";
        const copySourceMap = config.options?.sourcemaps && fs.existsSync(mapFile);

        // an already built core is copied instead of built, the combine step reads it from the output folder
        let copyPlugins = [
            {
                "apply": function (compiler)
                {
                    compiler.hooks.afterEmit.tapPromise("CablesWebpackCopyCore", async () =>
                    {
                        await fs.promises.copyFile(coreFile, path.join(targetDir, "cables.js"));
                        if (copySourceMap) await fs.promises.copyFile(mapFile, path.join(targetDir, "cables.js.map"));
                    });
                }
            },
            CablesWebpackHelper.removeEmptyChunk()
        ];
        if (config.plugins?.core) copyPlugins = copyPlugins.concat(config.plugins.core);
        if (config.plugins?.all) copyPlugins = copyPlugins.concat(config.plugins.all);

        let copyConfig = {
            "name": "core",
            "performance": { "hints": false },
            "mode": buildMode,
            "entry": config.entry,
            "output": { "path": targetDir },
            "plugins": copyPlugins,
            "module": {
                "rules": [
                    {
                        "test": /\.cables/,
                        "type": "json"
                    }
                ]
            }
        };
        if (config.overrides?.core) copyConfig = CablesWebpackHelper.mergeConfig(copyConfig, config.overrides.core);
        if (config.overrides?.all) copyConfig = CablesWebpackHelper.mergeConfig(copyConfig, config.overrides.all);
        return copyConfig;
    }

    const __coreDir = CablesWebpackHelper.getCoreDir(config);
    const __devDir = CablesWebpackHelper.getDevDir(config);

    /** @type {Object[]} */
    let plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": "\n\nvar CABLES = CABLES || {};" // FIXME: buildInfo?
        }),
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.core) plugins = plugins.concat(config.plugins.core);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "core",
        "devtool": (minify && config.options?.sourcemaps) ? "source-map" : false,
        // the core is around 100 KiB, warn when it gets unusually big
        "performance": {
            "maxAssetSize": 1024 * 1024,
            "maxEntrypointSize": 1024 * 1024
        },
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
            "usedExports": true,
            "minimize": minify
        },
        "module": {
            "rules": [
                { "sideEffects": false },
                {
                    "test": /\.frag/,
                    "use": loaderPath("raw-loader")
                },
                {
                    "test": /\.vert/,
                    "use": loaderPath("raw-loader")
                },
                {
                    "test": /\.wgsl/,
                    "use": loaderPath("raw-loader")
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
            "jwt-encode": "commonjs jwt-encode"
        },
        "resolve": {
            "alias": {
                "cables-shared-client": path.resolve(
                    __devDir,
                    "shared/client"
                )
            }
        }
    };

    if (config.overrides?.core) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.core);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
