import path from "path";
import fs from "fs";
import webpack from "webpack";
import { glob } from "glob";
import { fileURLToPath } from "url";
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
    logger.info("assembling ops");

    const sourceDir = path.join(path.resolve(path.dirname(config.entry)), "ops");
    const targetDir = path.join(config.output.path, "js");
    const buildMode = config.mode || "production";
    const minifyGlsl = config.options.minifyglsl || false;
    const combineJs = config.options.combinejs || true;

    fs.mkdirSync(targetDir, { "recursive": true });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const opsGlob = path.join(sourceDir, "./**/Ops.**.js");
    const jsFiles = glob.sync(opsGlob);

    const opNames = [];
    const opFiles = [];
    jsFiles.forEach((opFile) =>
    {
        const opName = path.basename(opFile, ".js");
        if (path.dirname(opFile).includes(opName))
        {
            const jsonFile = path.join(path.dirname(opFile), opName + ".json");
            const opDocs = jsonfile.readFileSync(jsonFile);
            CablesWebpackHelper.addOpToLookup(opDocs.id, opName);
            opNames.push(opName);
            opFiles.push(opFile);
        }
    });

    const plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": false,
            "raw": true,
            "banner": () =>
            {
                let banner = "\"use strict\";\n\n";
                banner += "var CABLES=CABLES||{};\n";
                banner += "CABLES.OPS=CABLES.OPS||{};\n\n";
                banner += "var Ops=Ops || {};\n";
                let namespaces = [];
                opNames.forEach((opName) =>
                {
                    const parts = opName.split(".");
                    for (let k = 1; k < parts.length; k++)
                    {
                        let partPartname = "";
                        for (let j = 0; j < k; j++) partPartname += parts[j] + ".";

                        partPartname = partPartname.substr(0, partPartname.length - 1);
                        namespaces.push(partPartname);

                    }
                });
                namespaces = CablesWebpackHelper.uniqueArray(namespaces);
                namespaces.sort((a, b) => { return a.localeCompare(b); });
                namespaces.forEach((namespace) =>
                {
                    banner += namespace + "=" + namespace + "|| {};\n";
                });
                return banner;
            },
        })
    ];

    if (!combineJs)
    {
        plugins.push(new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": () =>
            {
                let banner = "window.addEventListener('load', function(event) {\n";
                banner += "\tCABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
                banner += "\tdocument.dispatchEvent(CABLES.jsLoaded);\n";
                banner += "});\n";
                return banner;
            },
        }));
    }

    return {
        "name": "ops",
        "mode": buildMode,
        "entry": opFiles,
        "output": {
            "path": targetDir,
            "filename": "ops.js",
        },
        "optimization": {
            "concatenateModules": true,
            "usedExports": true,
        },
        "module": {
            "rules": [
                { "sideEffects": false },
                {
                    "test": /\.js/,
                    "use": {
                        "loader": path.resolve(path.join(__dirname, "./webpack.op.loader.js")),
                        "options": {
                            "minifyGlsl": minifyGlsl,
                        }
                    },
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
