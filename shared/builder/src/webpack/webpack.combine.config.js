import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean) =>
{
    command.log.info("combining js");
    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [
        {
            apply(compiler)
            {
                compiler.hooks.thisCompilation.tap("InlinePlugin", () =>
                {
                    if (combineJs)
                    {
                        const targetFile = path.resolve(path.join(targetDir, "patch.js"));

                        let jsonFileName = null;
                        const patchFiles = fs.readdirSync(sourceDir);
                        patchFiles.forEach((file) =>
                        {
                            if (path.basename(file).endsWith(".cables"))
                            {
                                jsonFileName = path.basename(file, ".cables");
                            }
                        });

                        const jsonFile = path.resolve(path.join(targetDir, jsonFileName + ".json"));
                        const opsFile = path.resolve(path.join(targetDir, "ops.js"));
                        const coreFile = path.resolve(path.join(targetDir, "cables.js"));

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
                            if(clean) fs.rmSync(sourceFile);
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
                                if(clean) fs.rmSync(sourceFile);
                            }
                        }

                        jsCode = jsCode.replaceAll(/[\u2028]/g, " ");
                        jsCode = jsCode.replaceAll(/[\u2029]/g, " ");
                        jsCode = jsCode.replaceAll(/[\u00A0]/g, " ");

                        jsCode = fs.readFileSync(coreFile, "utf8") + "\n" + jsCode;
                        fs.writeFileSync(targetFile, jsCode);

                        if(clean) {
                            fs.rmSync(coreFile);
                            fs.rmSync(opsFile);
                            fs.rmSync(jsonFile);
                        }
                    }
                });
            },
        },
    ];

    return {
        "name": "combine",
        "mode": isLiveBuild ? "production" : "development",
        "devtool": minify ? "source-map" : sourceMap,
        "plugins": plugins,
        "output": {
            "path": targetDir,
        },
    };
};
