import { createRequire } from "module";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";


// loaders are resolved from this package, not from the folder webpack runs in
const loaderPath = createRequire(import.meta.url).resolve;
/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;

    const patchFile = config.entry;
    const targetDir = config.output.path;
    const buildMode = config.mode || "production";
    const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;
    const indexHtml = config.options?.hasOwnProperty("index") ? config.options.index : true;
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    let plugins = [];
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

            patchSource = "patchFile: '" + CablesWebpackHelper.getJsPath(config) + CablesWebpackHelper.getJsonFileName(config) + "'";
        }
        else
        {
        // dependencies to other ops are resolved earlier, code of local commonjs libraries is minified into patch.js, we only need cdn things and esm-modules here
            usedDeps = deps.filter((dep) => { return dep.type && dep.type !== "op" && !(dep.type === "commonjs" && !dep.src.startsWith("http")); });
        }

        const finalJsPath = CablesWebpackHelper.getJsPath(config);

        // like the web export: remote urls stay as they are, local esm imports need a relative path starting with ./
        usedDeps = usedDeps.map((dep) =>
        {
            const isRemote = /^https?:\/\//i.test(dep.src);
            let url = isRemote ? dep.src : finalJsPath + dep.src;
            if (dep.type === "module" && !isRemote && !url.startsWith("/")) url = "./" + url;
            return { ...dep, "module": dep.type === "module", "url": url };
        });

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
                "template": path.resolve(path.join(__dirname, "../../views/patchview_export.hbs")),
                "minify": false,
                "title": patchName,
                "xhtml": true,
                "inject": false,
                "meta": {
                    "schema:charset": { "charset": "utf-8" },
                    "viewport": "width=device-width, user-scalable=no, initial-scale=1",
                    "schema:name": {
                        "itemprop": "name",
                        "content": patchName
                    },
                    "schema:description": {
                        "itemprop": "description",
                        "content": "made with cables"
                    },
                    "description": "made with cables",
                    "schema:image": {
                        "itemprop": "image",
                        "content": "screenshot.png"
                    }

                },
                "templateParameters": {
                    "patchName": patchName,
                    "patchSource": patchSource,
                    "assetPath": CablesWebpackHelper.getAssetPath(config),
                    "jsPath": finalJsPath,
                    "dependencies": usedDeps,
                    "cablesjs": cablesJs,
                    "corelibs": usedCoreLibs
                }
            }
            )
        );
    }
    plugins.push(CablesWebpackHelper.removeEmptyChunk());

    if (config.plugins?.html) plugins = plugins.concat(config.plugins.html);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "html",
        "mode": buildMode,
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
                    "test": /\.hbs$/,
                    "loader": loaderPath("handlebars-loader")
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "plugins": plugins,
        "dependencies": ["assets", "files", "combine"]
    };
    if (config.overrides?.html) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.html);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
