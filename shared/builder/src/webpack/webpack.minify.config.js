import path from "path";
import fs from "fs";
import { minify } from "terser";
import { glob } from "glob";
import jsonfile from "jsonfile";

export default (command, patchJson, sourceDir, targetDir, buildMode, combineJs, flat, doMinify, sourceMap) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        {
            apply(compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackMinifyPlugin", async (compilation) =>
                {
                    const code = {};
                    if (doMinify)
                    {
                        // collect jsfiles
                        const jsGlob = path.join(targetDir, "./**/**.js");
                        const jsFiles = glob.sync(jsGlob);
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

                            command.log.info("minified", outFile);
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
        }
    ];

    return {
        "name": "minify",
        "mode": buildMode,
        "output": {
            "path": targetDir
        },
        "plugins": plugins
    };
};
