import path from "path";
import fs from "fs";
import { CablesWebpackPatchJsonPlugin } from "./webpack.patchjson.plugin.js";

export default (patchJson, sourceDir, targetDir, isLiveBuild, combinejs, flat, minify, sourceMap, minifyGlsl) =>
{

    fs.mkdirSync(targetDir, { "recursive": true });

    let jsonFileName = null;
    const patchFiles = fs.readdirSync(sourceDir);
    patchFiles.forEach((file) => {
        if (path.basename(file).endsWith(".cables"))
        {
            jsonFileName = path.basename(file, ".cables");
        }
    });

    const plugins = [
        new CablesWebpackPatchJsonPlugin(patchJson, jsonFileName + ".json")
    ];

    return {
        "name": "json",
        "mode": isLiveBuild ? "production" : "development",
        "entry": {},
        "output": {
            "path": targetDir
        },
        "devtool": minify ? "source-map" : sourceMap,
        "plugins": plugins
    };
};
