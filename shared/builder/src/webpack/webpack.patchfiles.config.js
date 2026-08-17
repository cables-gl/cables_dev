import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling patchfiles");

    const patchFile = config.entry;
    const targetDir = config.output.path;
    const sourceDir = path.resolve(path.dirname(patchFile));
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const licenceFile = path.resolve(path.join(sourceDir, "LICENCE"));
    const screenshotFile = path.resolve(path.join(sourceDir, "screenshot.png"));
    const cablesFile = path.resolve(path.join(sourceDir, "cables.txt"));
    const creditsFile = path.resolve(path.join(sourceDir, "credits.txt"));
    const legalFile = path.resolve(path.join(sourceDir, "legal.txt"));
    const docsFile = path.resolve(path.join(sourceDir, "doc.md"));

    const patterns = [];
    if (fs.existsSync(licenceFile)) patterns.push(licenceFile);
    if (fs.existsSync(screenshotFile)) patterns.push(screenshotFile);
    if (fs.existsSync(cablesFile)) patterns.push(cablesFile);
    if (fs.existsSync(creditsFile)) patterns.push(creditsFile);
    if (fs.existsSync(legalFile)) patterns.push(legalFile);
    if (fs.existsSync(docsFile)) patterns.push(docsFile);

    let plugins = [
        new CopyPlugin({
            "patterns": patterns,
        }),
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.files) plugins = plugins.concat(config.plugins.files);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "files",
        "mode": buildMode,
        "plugins": plugins,
        "entry": patchFile,
        "output": {
            "path": targetDir,
        },
        "optimization": {
            "minimize": minify
        },
        "module": {
            "rules": [
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        }
    };
    if (config.overrides?.files) buildConfig = { ...buildConfig, ...config.overrides.files };
    if (config.overrides?.all) buildConfig = { ...buildConfig, ...config.overrides.all };

    return buildConfig;
};
