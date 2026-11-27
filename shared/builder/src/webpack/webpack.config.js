import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import fs from "fs";
import jsonfile from "jsonfile";
import { glob } from "glob";
import webpackConfigCore from "./webpack.core.config.js";
import webpackOpsConfig from "./webpack.ops.config.js";
import webpackHtmlConfig from "./webpack.html.config.js";
import webpackAssetsConfig from "./webpack.assets.config.js";
import webpackPatchFilesConfig from "./webpack.patchfiles.config.js";
import webpackPatchJsonConfig from "./webpack.patchjson.config.js";
import webpackOpDependenciesConfig from "./webpack.dependencies.config.js";
import webpackCombineConfig from "./webpack.combine.config.js";
import webpackMinifyConfig from "./webpack.minify.config.js";
import webpackHeadlessConfig from "./webpack.headless.config.js";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

/**
 * @typedef {Object} CablesBuildOptions
 * @property {("html"|"headless")} [type="html"]
 * @property {Boolean} [index=true]
 * @property {String} [jsonfilename]
 * @property {Boolean} [combinejs=true]
 * @property {Boolean} [flat=false]
 * @property {("auto"|"all"|"none")} [assets="auto"]
 * @property {Boolean} [minify=true]
 * @property {Boolean} [sourcemaps=false]
 * @property {Boolean} [minifyglsl=true]
 * @property {Boolean} [clean=false]
 * @property {Boolean} [install=true]
 * @property {("error"|"warn"|"info"|"verbose"|"debug")} [loglevel="info"]
 * @property {(Boolean|String)} [cache=false]
 * @property {String[]} [opsDirs]
 * @property {String} [coreFile]
 * @property {String} [coreDir]
 * @property {String} [libsDir]
 * @property {String} [corelibsDir]
 * @property {String} [assetLibraryDir]
 * @property {String} [devDir]
 */

/**
 * @typedef {Object} CablesBuildPlugins
 * @property {Object[]} [all]
 * @property {Object[]} [core]
 * @property {Object[]} [ops]
 * @property {Object[]} [dependencies]
 * @property {Object[]} [assets]
 * @property {Object[]} [files]
 * @property {Object[]} [patchjson]
 * @property {Object[]} [minify]
 * @property {Object[]} [combine]
 * @property {Object[]} [html]
 * @property {Object[]} [headless]
 */

/**
 * @typedef {Object} CablesBuildOverrides
 * @property {Object} [all]
 * @property {Object} [core]
 * @property {Object} [ops]
 * @property {Object} [dependencies]
 * @property {Object} [assets]
 * @property {Object} [files]
 * @property {Object} [patchjson]
 * @property {Object} [minify]
 * @property {Object} [combine]
 * @property {Object} [html]
 * @property {Object} [headless]
 */

/**
 * @typedef {Object} CablesWebpackConfig
 * @property {("production"|"development"|"none")} [mode="production"]
 * @property {String} entry
 * @property {{path: String}} output
 * @property {CablesBuildPlugins} [plugins]
 * @property {CablesBuildOverrides} [overrides]
 * @property {CablesBuildOptions} [options]
 */
/**
 * @param {CablesWebpackConfig} config
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 * @returns {Object[]}
 */
export default (config, logger = console) =>
{
    const options = {};
    Object.keys(config.options || {}).forEach((key) =>
    {
        if (key.startsWith("WEBPACK_")) return;
        const value = config.options[key];
        if (value === "true") options[key] = true;
        else if (value === "false") options[key] = false;
        else options[key] = value;
    });
    config.options = options;

    const baseLogger = logger || console;
    const logLevels = ["error", "warn", "info", "verbose", "debug"];
    const statsPresets = { "error": "errors-only", "warn": "errors-warnings", "info": "minimal", "verbose": "normal", "debug": "verbose" };
    const logLevel = logLevels.includes(config.options?.loglevel) ? config.options.loglevel : "info";
    const logLevelIndex = logLevels.indexOf(logLevel);
    logger = {
        "error": (...args) => { baseLogger.error(...args); },
        "warn": (...args) => { if (logLevelIndex >= 1) baseLogger.warn(...args); },
        "info": (...args) => { if (logLevelIndex >= 2) baseLogger.info(...args); },
        "log": (...args) => { if (logLevelIndex >= 2) baseLogger.log(...args); },
        "debug": (...args) => { if (logLevelIndex >= 4) baseLogger.debug(...args); }
    };

    const buildType = config.options?.type || "html";
    if (!["html", "headless"].includes(buildType)) throw new Error("unknown build type " + buildType + ", use html or headless");
    // same settings as the headless export of the web export
    if (buildType === "headless") config.options = { ...config.options, "combinejs": false, "index": false, "minify": false, "jsonfilename": "patch" };

    config.entry = path.resolve(config.entry);
    config.output.path = path.resolve(config.output.path);
    let patchFile = config.entry;
    const isDir = fs.lstatSync(config.entry).isDirectory();
    if (isDir)
    {
        const projectFileGlop = path.join(config.entry, "./*.cables");
        const projectFiles = glob.sync(projectFileGlop, { "windowsPathsNoEscape": true });
        if (!projectFiles.length)
        {
            throw new Error("no projectfile found in " + config.entry);
        }
        else if (projectFiles.length > 1)
        {
            let message = "multiple projectfiles found in " + config.entry + ":\n\n";
            projectFiles.forEach((file) =>
            {
                message += "    - " + file + "\n";
            });
            throw new Error(message);
        }
        else
        {
            patchFile = projectFiles[0];
            config.entry = patchFile;
        }
    }
    const patchJson = jsonfile.readFileSync(patchFile);

    // buildable exports bring core, libs and corelibs in _build/ next to the patch file
    const buildableDir = path.join(path.dirname(patchFile), BuildUtil.BUILDABLE_DIR);
    const buildableDefaults = {};
    if (!config.options?.coreFile && !config.options?.coreDir && fs.existsSync(path.join(buildableDir, "cables.js"))) buildableDefaults.coreFile = path.join(buildableDir, "cables.js");
    if (!config.options?.libsDir && fs.existsSync(path.join(buildableDir, "libs"))) buildableDefaults.libsDir = path.join(buildableDir, "libs");
    if (!config.options?.corelibsDir && fs.existsSync(path.join(buildableDir, "corelibs"))) buildableDefaults.corelibsDir = path.join(buildableDir, "corelibs");
    config.options = { ...config.options, ...buildableDefaults };

    // build steps read files written by earlier steps from the output folder, leftovers of earlier builds can break this
    const outputDir = path.resolve(config.output.path);
    if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length > 0)
    {
        if (config.options?.clean)
        {
            logger.info("removing output folder", outputDir);
            fs.rmSync(outputDir, { "recursive": true, "force": true });
        }
        else
        {
            logger.warn("output folder " + outputDir + " is not empty, files of earlier builds can break the build, use an empty folder or the clean option");
        }
    }

    CablesWebpackHelper.collectOps(config, patchJson);
    CablesWebpackHelper.prepareAssets(config, patchJson);
    CablesWebpackHelper.prepareOpIds(config, patchJson);

    const coreConfig = webpackConfigCore(config, patchJson, logger);
    const opsConfig = webpackOpsConfig(config, patchJson, logger);
    const depsConfigs = webpackOpDependenciesConfig(config, patchJson, logger);
    const assetsConfig = webpackAssetsConfig(config, patchJson, logger);
    const filesConfig = webpackPatchFilesConfig(config, patchJson, logger);
    const jsonConfig = webpackPatchJsonConfig(config, patchJson, logger);

    /** @type {String[]} */
    const depsConfigNames = [];
    depsConfigs.forEach((depsConfig) =>
    {
        depsConfigNames.push(depsConfig.name);
    });

    const combineConfig = webpackCombineConfig(config, patchJson, logger, depsConfigNames);
    const minifyConfig = webpackMinifyConfig(config, patchJson, logger);
    const htmlConfig = webpackHtmlConfig(config, patchJson, logger);

    const buildConfigs = [
        coreConfig,
        opsConfig,
        ...depsConfigs,
        assetsConfig,
        filesConfig,
        jsonConfig,
        combineConfig,
        minifyConfig,
        htmlConfig
    ];
    if (buildType === "headless") buildConfigs.push(webpackHeadlessConfig(config, patchJson, logger));
    // op code and subpatch attachments depend on the options and the op names, a change of these invalidates the cache
    const cacheVersion = crypto.createHash("md5").update(JSON.stringify({ "options": config.options || {}, "ops": CablesWebpackHelper.getOpLookupIds() })).digest("hex");
    buildConfigs.forEach((buildConfig) =>
    {
        if (!buildConfig.hasOwnProperty("stats")) buildConfig.stats = statsPresets[logLevel];
        if (config.options?.cache && !buildConfig.hasOwnProperty("cache"))
        {
            buildConfig.cache = {
                "type": "filesystem",
                "name": buildConfig.name,
                "version": cacheVersion,
                "buildDependencies": { "config": [fileURLToPath(import.meta.url)] }
            };
            if (typeof config.options.cache === "string") buildConfig.cache.cacheDirectory = path.resolve(config.options.cache);
        }
    });
    return buildConfigs;

};
