import path from "path";
import fs from "fs";
import { minify } from "terser";
import jsonfile from "jsonfile";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;

    const patchFile = config.entry;

    const targetDir = CablesWebpackHelper.getJsDir(config);
    const buildMode = config.mode || "production";
    const doMinify = config.options?.hasOwnProperty("minify") ? config.options.minify : true;
    const sourceMap = config.options?.hasOwnProperty("sourcemaps") ? config.options.sourcemaps : false;
    const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    let plugins = [
        {
            "apply": function (compiler)
            {
                compiler.hooks.make.tapPromise("CablesWebpackMinifyPlugin", async (compilation) =>
                {
                    if (doMinify)
                    {
                        // core, ops and corelibs are minified by webpack, only libs and op dependencies are copied unminified
                        const depFiles = CablesWebpackHelper.getOpDependencies()
                            .filter((dep) => { return dep.src && !/^https?:\/\//i.test(dep.src) && dep.src.endsWith(".js"); })
                            .map((dep) => { return { "file": path.join(targetDir, dep.src), "module": dep.type === "module" }; })
                            .filter((dep) => { return fs.existsSync(dep.file); });

                        for (const dep of depFiles)
                        {
                            const file = dep.file;
                            const toMinify = fs.readFileSync(file, "utf8");

                            const result = await minify(toMinify, {
                                "compress": true,
                                "mangle": true,
                                "module": dep.module,
                                "format": { "comments": false },
                                "sourceMap": sourceMap ? {
                                    "filename": path.basename(file).replace(/\.js$/, ".min.js"),
                                    "url": path.basename(file) + ".map"
                                } : false
                            });

                            const outFile = file.replace(/\.js$/, ".js");
                            fs.writeFileSync(outFile, result.code ?? "", "utf8");

                            if (sourceMap && result.map)
                            {
                                fs.writeFileSync(outFile + ".map", result.map, "utf8");
                            }

                            logger.debug("minified", outFile);
                        }

                        const jsonFileName = CablesWebpackHelper.getJsonFileName(config);
                        if (!combineJs)
                        {
                            const json = await jsonfile.readFile(path.resolve(targetDir, jsonFileName));
                            await jsonfile.writeFile(path.resolve(targetDir, jsonFileName), json);
                        }

                    }
                });
            }
        },
        CablesWebpackHelper.removeEmptyChunk()
    ];

    if (config.plugins?.minify) plugins = plugins.concat(config.plugins.minify);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "minify",
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir
        },
        "plugins": plugins,
        "module": {
            "rules": [
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "dependencies": ["patchjson"]
    };
    if (config.overrides?.minify) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.minify);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
