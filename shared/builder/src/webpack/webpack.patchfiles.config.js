import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

export default (patchJson, sourceDir, targetDir, buildMode, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling patchfiles");

    fs.mkdirSync(targetDir, { "recursive": true });

    const licenceFile = path.resolve(path.join(sourceDir, "LICENCE"));
    const screenshotFile = path.resolve(path.join(sourceDir, "screenshot.png"));
    const cablesFile = path.resolve(path.join(sourceDir, "cables.txt"));
    const creditsFile = path.resolve(path.join(sourceDir, "credits.txt"));
    const legalFile = path.resolve(path.join(sourceDir, "legal.txt"));
    const docsFile = path.resolve(path.join(sourceDir, "doc.md"));

    const patterns = [];
    if (fs.existsSync(licenceFile)) patterns.push(licenceFile);
    if (fs.existsSync(screenshotFile)) patterns.push(screenshotFile);
    if (fs.existsSync(cablesFile)) patterns.push(cablesFile);
    if (fs.existsSync(creditsFile)) patterns.push(creditsFile);
    if (fs.existsSync(legalFile)) patterns.push(legalFile);
    if (fs.existsSync(docsFile)) patterns.push(docsFile);

    const plugins = [
        new CopyPlugin({
            "patterns": patterns,
        }),
        CablesWebpackHelper.removeEmptyChunk()
    ];

    return {
        "name": "files",
        "mode": buildMode,
        "plugins": plugins,
        "output": {
            "path": targetDir,
        },
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
