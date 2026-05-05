import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

export default (patchJson, sourceDir, targetDir, isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl) =>
{
    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const combineJs = minify; // FIXME: needs combine option

    let deps = CablesWebpackHelper.getOpDependencies();
    let coreLibs = CablesWebpackHelper.getCoreLibs();

    let jsonFileName = null;
    const patchFiles = fs.readdirSync(sourceDir);
    patchFiles.forEach((file) => {
        if (path.basename(file).endsWith(".cables"))
        {
            jsonFileName = path.basename(file, ".cables");
        }
    });

    let patchSource = "patchFile: 'js/" + jsonFileName + ".json'";
    if (combineJs) patchSource = "patch: CABLES.exportedPatch";

    let finalJsPath = "js/";
    if(flat) finalJsPath = "";

    const cablesjs = [];
    if (combineJs)
    {
        cablesjs.push("patch.js");
    }
    else
    {
        cablesjs.push("cables.js");
        cablesjs.push("ops.js");
    }

    const patchName = patchJson.name;
    const plugins = [
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
                    "dependencies": deps,
                    "cablesjs": cablesjs,
                    "corelibs": coreLibs,
                },
            },
        ),
    ];

    return {
        "name": "html",
        "mode": isLiveBuild ? "production" : "development",
        "output": {
            "path": targetDir,
            "filename": path.join("js", "index.html"),
        },
        module: {
            rules: [
                {
                    test: /\.hbs$/,
                    loader: "handlebars-loader",
                },
            ],
        },
        "plugins": plugins,
    };
};
