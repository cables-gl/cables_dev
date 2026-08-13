import path from "path";
import fs from "fs";
import { minify } from "terser";
import { glob } from "glob";
import jsonfile from "jsonfile";
import CablesWebpackHelper from "./webpack.helper.js";

/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log":function, "error": function, "warn":function, "info":function, "debug":function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{
    if (!logger) logger = console;

    const patchFile = config.entry;
    const sourceDir = path.resolve(path.dirname(patchFile));

    const targetDir = path.join(config.output.path, "js");
    const buildMode = config.mode;
    const doMinify = config.options.minify;
    const sourceMap = config.options.sourcemaps;

    fs.mkdirSync(targetDir, { "recursive": true });

    // collect jsfiles
    const jsGlob = path.join(targetDir, "./**/**.js");
    const jsFiles = glob.sync(jsGlob);

    const plugins = [
        {
            apply(compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackMinifyPlugin", async (compilation) =>
                {
                    const code = {};
                    if (doMinify)
                    {

                        jsFiles.forEach((jsFile) =>
                        {
                            code[jsFile] = fs.readFileSync(jsFile, "utf8");
                        });

                        for (const file of jsFiles)
                        {
                            const toMinify = fs.readFileSync(file, "utf8");

                            const result = await minify(toMinify, {
                                "compress": true,
                                "mangle": true,
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

                            logger.info("minified", outFile);
                        }

                        let jsonFileName = null;
                        const patchFiles = fs.readdirSync(sourceDir);
                        patchFiles.forEach((file) =>
                        {
                            if (path.basename(file).endsWith(".cables"))
                            {
                                jsonFileName = path.basename(file, ".cables") + ".json";
                            }
                        });
                        if (jsonFileName)
                        {
                            const patchJson = await jsonfile.readFile(path.resolve(targetDir, jsonFileName));
                            await jsonfile.writeFile(path.resolve(targetDir, jsonFileName), patchJson);
                        }

                    }
                });
            }
        },
        CablesWebpackHelper.removeEmptyChunk()
    ];

    return {
        "name": "minify",
        "mode": buildMode,
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
        }
    };
};
