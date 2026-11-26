import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;
    const buildUtil = new BuildUtil(logger);
    logger.info("assembling patchfiles");

    const patchFile = config.entry;
    const targetDir = config.output.path;
    const sourceDir = path.resolve(path.dirname(patchFile));
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const screenshotFile = path.resolve(path.join(sourceDir, "screenshot.png"));

    // like the web export, credits, legal and docs only look at the ops on the top level of the patch
    const opDirs = {};
    CablesWebpackHelper.getOps().forEach((op) => { opDirs[op.name] = op.dir; });
    const opDocs = [];
    (patchJson.ops || []).forEach((op) =>
    {
        const opName = CablesWebpackHelper.getOpNameById(op.opId) || op.objName;
        if (!opName || !opDirs.hasOwnProperty(opName)) return;
        try
        {
            opDocs.push(JSON.parse(fs.readFileSync(path.join(opDirs[opName], opName + ".json"), "utf8")));
        }
        catch (e) {}
    });

    const getLegalText = () =>
    {
        let libs = [];
        opDocs.forEach((opDoc) => { if (opDoc.libs) libs = libs.concat(opDoc.libs); });
        libs = [...new Set(libs)];
        const libInfos = {};
        libs.forEach((lib) =>
        {
            if (lib.startsWith("/assets/") && lib.endsWith(".js")) return;
            try
            {
                const libsDir = config.options?.libsDir ? path.resolve(config.options.libsDir) : path.join(CablesWebpackHelper.getDevDir(config), "shared", "libs");
                libInfos[lib] = JSON.parse(fs.readFileSync(path.join(libsDir, path.parse(lib).name + ".json"), "utf8"));
            }
            catch (e)
            {
                logger.error("FAILED TO LOAD INFOFILE FOR LIBRARY:", lib);
            }
        });
        return buildUtil.getLegalTextArray(opDocs, libs, libInfos).join("\n");
    };

    // files of an export are copied, projects that are not exported get them generated like the web export does
    const infoFiles = {
        "LICENCE": () => { return buildUtil.getLicenceText(); },
        "cables.txt": () => { return buildUtil.getCablesInfoText(); },
        "credits.txt": () => { return buildUtil.getCreditsTextArray(opDocs).join("\n"); },
        "legal.txt": getLegalText,
        "doc.md": () => { return buildUtil.getEmbeddingDoc(CablesWebpackHelper.getPatchWithOpNames(patchJson)); }
    };

    const patterns = [];
    /** @type {Object<String, String>} */
    const generatedFiles = {};
    if (fs.existsSync(screenshotFile)) patterns.push(screenshotFile);
    Object.keys(infoFiles).forEach((fileName) =>
    {
        const file = path.resolve(path.join(sourceDir, fileName));
        if (fs.existsSync(file))
        {
            patterns.push(file);
        }
        else
        {
            const content = infoFiles[fileName]();
            if (content) generatedFiles[fileName] = content;
        }
    });

    let plugins = [CablesWebpackHelper.removeEmptyChunk()];
    // the copy plugin fails without patterns
    if (patterns.length > 0) plugins.push(new CopyPlugin({ "patterns": patterns }));
    if (Object.keys(generatedFiles).length > 0)
    {
        plugins.push({
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackInfoFiles", (compilation) =>
                {
                    compilation.hooks.processAssets.tap({
                        "name": "CablesWebpackInfoFiles",
                        "stage": webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                    }, () =>
                    {
                        Object.keys(generatedFiles).forEach((fileName) =>
                        {
                            compilation.emitAsset(fileName, new webpack.sources.RawSource(generatedFiles[fileName]));
                        });
                    });
                });
            }
        });
    }

    if (config.plugins?.files) plugins = plugins.concat(config.plugins.files);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "files",
        "performance": {
            "hints": false
        },
        "mode": buildMode,
        "plugins": plugins,
        "entry": patchFile,
        "output": {
            "path": targetDir
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
    if (config.overrides?.files) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.files);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
