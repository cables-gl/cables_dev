import path from "path";
import fs from "fs";
import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null, dependencies = []) =>
{
    if (!logger) logger = console;
    logger.info("combining js");

    const patchFile = config.entry;
    const sourceDir = path.resolve(path.dirname(patchFile));
    const targetDir = path.join(config.output.path, "js");
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
            apply(compiler)
            {
                compiler.hooks.thisCompilation.tap("InlinePlugin", (compilation) =>
                {
                    if (!combineJs) return;
                    compilation.hooks.afterOptimizeAssets.tap("InlinePluginProcessAssets", (assets) =>
                    {
                        let jsonFileName = path.basename(config.entry, ".cables") + ".json";
                        const jsonFile = path.resolve(path.join(targetDir, jsonFileName));
                        const proJson = fs.readFileSync(jsonFile);
                        const opsCode = fs.readFileSync(opsFile);

                        let jsCode = "\n";
                        jsCode += "if(!CABLES.exportedPatches) CABLES.exportedPatches={};";
                        jsCode += "CABLES.exportedPatches['" + patchJson.shortId + "']=" + proJson + ";";

                        jsCode += "\n";
                        jsCode += "if(!CABLES.exportedPatch){CABLES.exportedPatch=CABLES.exportedPatches['" + patchJson.shortId + "']}";
                        jsCode += "\n";
                        jsCode += opsCode;
                        jsCode += "\n";
                        jsCode += "window.addEventListener('load', function(event) {\n";
                        jsCode += "CABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
                        jsCode += "document.dispatchEvent(CABLES.jsLoaded);\n";
                        jsCode += "});\n";

                        const libScripts = CablesWebpackHelper.getCoreLibs();
                        const depScripts = CablesWebpackHelper.getOpDependencies();

                        for (let i = 0; i < libScripts.length; i++)
                        {
                            const lib = libScripts[i];
                            const sourceFile = path.resolve(path.join(targetDir, lib + ".js"));
                            jsCode += "// start " + lib + "\n";
                            jsCode += fs.readFileSync(sourceFile, "utf8");
                            jsCode += "// end " + lib + "\n";
                            fs.rmSync(sourceFile);
                        }

                        for (let i = 0; i < depScripts.length; i++)
                        {
                            const lib = depScripts[i];
                            const sourceFile = path.resolve(path.join(targetDir, lib.src));
                            if (lib.src && lib.type === "commonjs" && !lib.src.startsWith("http"))
                            {
                                jsCode += "// start " + lib.src + "\n";
                                jsCode += fs.readFileSync(sourceFile, "utf8");
                                jsCode += "// end " + lib.src + "\n";
                                fs.rmSync(sourceFile);
                            }
                        }

                        jsCode = jsCode.replaceAll(/[\u2028]/g, " ");
                        jsCode = jsCode.replaceAll(/[\u2029]/g, " ");
                        jsCode = jsCode.replaceAll(/[\u00A0]/g, " ");

                        jsCode = fs.readFileSync(coreFile, "utf8") + "\n" + jsCode;

                        const source = new webpack.sources.RawSource(jsCode);
                        compilation.emitAsset(assetName, source);

                        // fs.writeFileSync(targetFile, jsCode);

                        fs.rmSync(coreFile);
                        fs.rmSync(opsFile);
                        fs.rmSync(jsonFile);
                    });
                });
            },
        },
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.combine) plugins = plugins.concat(config.plugins.combine);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "combine",
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
        "dependencies": ["core", "ops", "patchjson", ...dependencies],
    };
    if (config.overrides?.combine) buildConfig = { ...buildConfig, ...config.overrides.combine };
    if (config.overrides?.all) buildConfig = { ...buildConfig, ...config.overrides.all };
    return buildConfig;
};
