import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

export default (command, patchJson, sourceDir, targetDir, buildMode, combineJs, flat, indexHtml) =>
{
    const plugins = [];
    if (indexHtml)
    {
        command.log.info("assembling html");

        fs.mkdirSync(targetDir, { "recursive": true });

        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        let deps = CablesWebpackHelper.getOpDependencies();
        let coreLibs = CablesWebpackHelper.getCoreLibs();

        let usedDeps = [];
        let usedCoreLibs = [];
        let patchSource = "patch: CABLES.exportedPatch";

        if (!combineJs)
        {
            usedDeps = deps;
            usedCoreLibs = coreLibs;

            let jsonFileName = null;
            const patchFiles = fs.readdirSync(sourceDir);
            patchFiles.forEach((file) =>
            {
                if (path.basename(file)
                    .endsWith(".cables"))
                {
                    jsonFileName = path.basename(file, ".cables");
                }
            });

            patchSource = "patchFile: 'js/" + jsonFileName + ".json'";
        }
        else
        {
        // dependencies to other ops are resolved earlier, code of local commonjs libraries is minified into patch.js, we only need cdn things and esm-modules here
            usedDeps = deps.filter((dep) => { return dep.type && dep.type !== "op" && !(dep.type === "commonjs" && !dep.src.startsWith("http")); });
        }

        let finalJsPath = "js/";
        if (flat) finalJsPath = "";

        const cablesJs = [];
        if (combineJs)
        {
            cablesJs.push("patch.js");
        }
        else
        {
            cablesJs.push("cables.js");
            cablesJs.push("ops.js");
        }

        const patchName = patchJson.name;

        plugins.push(
            new HtmlWebpackPlugin({
                "template": path.resolve(path.join(__dirname, "./patchview_export.hbs")),
                "minify": false,
                "title": patchName,
                "xhtml": true,
                "inject": false,
                "meta": {
                    "schema:charset": { "charset": "utf-8" },
                    "viewport": "width=device-width, user-scalable=no, initial-scale=1",
                    "schema:name": {
                        "itemprop": "name",
                        "content": patchName,
                    },
                    "schema:description": {
                        "itemprop": "description",
                        "content": "made with cables",
                    },
                    "description": "made with cables",
                    "schema:image": {
                        "itemprop": "image",
                        "content": "screenshot.png",
                    },

                },
                "templateParameters": {
                    "patchSource": patchSource,
                    "assetPath": "",
                    "jsPath": finalJsPath,
                    "dependencies": usedDeps,
                    "cablesjs": cablesJs,
                    "corelibs": usedCoreLibs,
                },
            },
            )
        );
    }

    return {
        "name": "html",
        "mode": buildMode,
        "output": {
            "path": targetDir,
            "filename": path.join("js", "index.html"),
        },
        "module": {
            "rules": [
                {
                    "test": /\.hbs$/,
                    "loader": "handlebars-loader",
                },
            ],
        },
        "plugins": plugins,
    };
};
