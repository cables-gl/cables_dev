import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 * @param {String[]} [dependencies]
 */
export default (config, patchJson, logger = console, dependencies = []) =>
{
    if (!logger) logger = console;
    const buildUtil = new BuildUtil(logger);
    logger.info("combining js");

    const patchFile = config.entry;
    const sourceDir = path.resolve(path.dirname(patchFile));
    const targetDir = CablesWebpackHelper.getJsDir(config);
    const buildMode = config.mode || "production";
    const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const opsFile = path.resolve(path.join(targetDir, "ops.js"));
    const coreFile = path.resolve(path.join(targetDir, "cables.js"));
    const targetFile = path.resolve(path.join(targetDir, "patch.js"));
    const assetName = path.basename(targetFile);

    let plugins = [
        {
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("InlinePlugin", (compilation) =>
                {
                    if (!combineJs) return;
                    compilation.hooks.afterOptimizeAssets.tap("InlinePluginProcessAssets", (_assets) =>
                    {
                        const jsonFileName = CablesWebpackHelper.getJsonFileName(config);
                        const jsonFile = path.resolve(path.join(targetDir, jsonFileName));

                        const missing = [];
                        if (!fs.existsSync(coreFile)) missing.push("core (" + path.basename(coreFile) + ")");
                        if (!fs.existsSync(opsFile)) missing.push("ops (" + path.basename(opsFile) + ")");
                        if (!fs.existsSync(jsonFile)) missing.push("patchjson (" + jsonFileName + ")");
                        if (missing.length > 0)
                        {
                            compilation.errors.push(new webpack.WebpackError("can not combine, not built: " + missing.join(", ") + ", see errors of these steps"));
                            return;
                        }

                        const proJson = fs.readFileSync(jsonFile, "utf8");
                        const opsCode = fs.readFileSync(opsFile, "utf8");

                        let jsCode = buildUtil.getExportedPatchCode(patchJson.shortId, proJson);
                        jsCode += "\n";
                        jsCode += opsCode;
                        jsCode += buildUtil.getJsLoadedCode();

                        const libScripts = CablesWebpackHelper.getCoreLibs();
                        const depScripts = CablesWebpackHelper.getOpDependencies();

                        for (let i = 0; i < libScripts.length; i++)
                        {
                            const lib = libScripts[i];
                            const sourceFile = path.resolve(path.join(targetDir, lib + ".js"));
                            if (!fs.existsSync(sourceFile))
                            {
                                compilation.errors.push(new webpack.WebpackError("core lib " + lib + " was not built, see errors of dependencies"));
                                continue;
                            }
                            jsCode += buildUtil.getLibCode(lib, fs.readFileSync(sourceFile, "utf8"));
                            fs.rmSync(sourceFile);
                        }

                        for (let i = 0; i < depScripts.length; i++)
                        {
                            const lib = depScripts[i];
                            const sourceFile = path.resolve(path.join(targetDir, lib.src));
                            if (lib.src && lib.type === "commonjs" && !lib.src.startsWith("http"))
                            {
                                if (!fs.existsSync(sourceFile))
                                {
                                    compilation.errors.push(new webpack.WebpackError("op dependency " + lib.src + " was not built, see errors of the dependencies builds"));
                                    continue;
                                }
                                jsCode += buildUtil.getLibCode(lib.src, fs.readFileSync(sourceFile, "utf8"));
                                fs.rmSync(sourceFile);
                            }
                        }

                        jsCode += "window.CABLES=CABLES\n";
                        jsCode += "window.Ops =Ops\n";

                        jsCode = buildUtil.cleanCombinedCode(jsCode);

                        jsCode = fs.readFileSync(coreFile, "utf8") + "\n" + jsCode;

                        const source = new webpack.sources.RawSource(jsCode);
                        compilation.emitAsset(assetName, source);

                        // fs.writeFileSync(targetFile, jsCode);

                        fs.rmSync(coreFile);
                        fs.rmSync(opsFile);
                        fs.rmSync(jsonFile);
                    });
                });
            }
        },
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.combine) plugins = plugins.concat(config.plugins.combine);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "combine",
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
        },
        "dependencies": ["core", "ops", "patchjson", "minify", ...dependencies]
    };
    if (config.overrides?.combine) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.combine);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);
    return buildConfig;
};
