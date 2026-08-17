import path from "path";
import fs from "fs";
import webpack from "webpack";
import { fileURLToPath } from "url";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import CablesWebpackHelper from "./webpack.helper.js";

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
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

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
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.core) plugins = plugins.concat(config.plugins.core);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
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
            "usedExports": true,
            "minimize": minify
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

    if (config.options?.analyze)
    {
        let reportsPath = config.options.analyze.path ? path.resolve(config.options.analyze.path) : path.join(__dirname, "reports");
        const analyzer = new BundleAnalyzerPlugin(
            {
                "analyzerMode": config.options.analyze.mode || "static",
                "openAnalyzer": false,
                "reportTitle": "cables " + buildConfig.name,
                "reportFilename": path.join(reportsPath, "report_" + buildConfig.name + ".html"),
                "bundleDir": targetDir
            });
        buildConfig.plugins = buildConfig.plugins || [];
        buildConfig.plugins.push(analyzer);
    }

    if (config.overrides?.core) buildConfig = { ...buildConfig, ...config.overrides.core };
    if (config.overrides?.all) buildConfig = { ...buildConfig, ...config.overrides.all };

    return buildConfig;
};
