import path from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import { glob } from "glob";

export default (command, patchJson, sourceDir, targetDir, isLiveBuild, combineJs, flat, minify, sourceMap, minifyGlsl, clean) =>
{
    command.log.info("minify js", targetDir, minify);
    fs.mkdirSync(targetDir, { "recursive": true });

    const plugins = [];

    return {
        "name": "minify",
        "mode": isLiveBuild ? "production" : "development",
        "entry": () => {
            const entries = {};
            if(minify) {
                // collect jsfiles
                const jsGlob = path.join(targetDir, "./**/**.js");
                const jsFiles = glob.sync(jsGlob);
                jsFiles.forEach((jsFile) =>
                {
                    entries[path.basename(jsFile, ".js")] = jsFile;
                });

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

                entries.cables = path.resolve(path.join(targetDir, "cables.js"));
                entries.ops = path.resolve(path.join(targetDir, "ops.js"));
            }
            return entries;
        },
        "output": {
            "path": targetDir,
            "filename": "[name].js",
        },
        "plugins": plugins,
        "optimization": {
            "minimizer": [
                new TerserPlugin({
                    "extractComments": false,
                    "terserOptions": { "format": { "comments": false } },
                })],
            "minimize": minify,
        },

    };
};
