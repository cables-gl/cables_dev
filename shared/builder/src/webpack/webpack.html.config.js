import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
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
    const targetDir = config.output.path;
    const sourceDir = path.resolve(path.dirname(patchFile));
    const buildMode = config.mode || "production";
    const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;
    const indexHtml = config.options?.hasOwnProperty("index") ? config.options.index : true;
    const flat = config.options?.hasOwnProperty("flat") ? config.options.flat : false;

    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const plugins = [];
    if (indexHtml)
    {
        logger.info("assembling html");

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
                if (path.basename(file).endsWith(".cables"))
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

        usedDeps.forEach((dep) =>
        {
            if (dep.type === "module") dep.module = true;
        });

        let finalJsPath = "./js/";
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
                    "patchName": patchName,
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
        plugins.push(CablesWebpackHelper.removeEmptyChunk());
    }

    return {
        "name": "html",
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir,
        },
        "module": {
            "rules": [
                {
                    "test": /\.hbs$/,
                    "loader": "handlebars-loader",
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ],
        },
        "plugins": plugins,
    };
};
