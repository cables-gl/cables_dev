import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import webpack from "webpack";
import jsonfile from "jsonfile";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

/**
 * package.json and run.js to run the patch with node, like the headless export of the web export
 *
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = console) =>
{
    if (!logger) logger = console;
    const buildUtil = new BuildUtil(logger);
    logger.info("assembling headless package");

    const patchFile = config.entry;
    const targetDir = config.output.path;
    const buildMode = config.mode || "production";
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const jsPath = CablesWebpackHelper.getJsPath(config);

    const opDocs = CablesWebpackHelper.getOps().map((op) => { return jsonfile.readFileSync(path.join(op.dir, op.name + ".json")); });

    let libs = [];
    opDocs.forEach((opDoc) => { if (opDoc.libs) libs = libs.concat(opDoc.libs); });
    libs = [...new Set(libs)];

    const manifestLibs = [];
    libs.forEach((lib) => { manifestLibs.push({ "src": jsPath + lib, "type": "commonjs" }); });
    CablesWebpackHelper.getCoreLibs().forEach((coreLib) => { manifestLibs.push({ "src": jsPath + coreLib + ".js", "type": "commonjs" }); });
    opDocs.forEach((opDoc) =>
    {
        if (!opDoc.dependencies) return;
        opDoc.dependencies.filter((dep) => { return dep.type && dep.type !== "npm" && dep.type !== "op"; }).forEach((dep) =>
        {
            let src = dep.src;
            if (!src.startsWith("http")) src = jsPath + src.replace(/^\.\//, "");
            if (manifestLibs.some((lib) => { return lib.src === src && lib.type === dep.type; })) return;
            const manifestLib = { "src": src, "type": dep.type };
            if (dep.type === "module") manifestLib.export = dep.export;
            manifestLibs.push(manifestLib);
        });
    });

    const name = "cables_" + String(patchJson.name || "patch").replace(/[/\\?<>:*|"\x00-\x1f]/g, "").replace(/ /g, "_") + "_headless";
    const npmDependencies = buildUtil.getNpmDependencies(opDocs);
    const files = {
        "package.json": buildUtil.getHeadlessPackageJson(name, "0.0." + (patchJson.exports || 0), npmDependencies, jsPath + CablesWebpackHelper.getJsonFileName(config), manifestLibs),
        "run.js": fs.readFileSync(path.join(__dirname, "../headless/run.js"), "utf8")
    };

    let plugins = [
        CablesWebpackHelper.removeEmptyChunk(),
        {
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("CablesWebpackHeadless", (compilation) =>
                {
                    compilation.hooks.processAssets.tap({
                        "name": "CablesWebpackHeadless",
                        "stage": webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                    }, () =>
                    {
                        Object.keys(files).forEach((fileName) =>
                        {
                            compilation.emitAsset(fileName, new webpack.sources.RawSource(files[fileName]));
                        });
                    });
                });
            }
        }
    ];
    const install = config.options?.hasOwnProperty("install") ? config.options.install : true;
    if (install && Object.keys(npmDependencies).length > 0)
    {
        plugins.push({
            "apply": function (compiler)
            {
                compiler.hooks.afterEmit.tapPromise("CablesWebpackHeadlessInstall", () =>
                {
                    logger.info("installing npm dependencies of the ops in", targetDir);
                    return new Promise((resolve) =>
                    {
                        // npm is npm.cmd on windows, which node only starts through a shell
                        const npm = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install", "--omit=dev"], {
                            "cwd": targetDir,
                            "stdio": "inherit",
                            "shell": process.platform === "win32"
                        });
                        npm.on("error", (e) =>
                        {
                            logger.warn("npm install failed, run npm install in " + targetDir, e.message);
                            resolve();
                        });
                        npm.on("close", (code) =>
                        {
                            if (code !== 0) logger.warn("npm install failed, run npm install in " + targetDir);
                            resolve();
                        });
                    });
                });
            }
        });
    }

    if (config.plugins?.headless) plugins = plugins.concat(config.plugins.headless);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let buildConfig = {
        "name": "headless",
        "mode": buildMode,
        "entry": patchFile,
        "output": {
            "path": targetDir
        },
        "module": {
            "rules": [
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "plugins": plugins,
        "dependencies": ["assets", "files", "combine"]
    };
    if (config.overrides?.headless) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.headless);
    if (config.overrides?.all) buildConfig = CablesWebpackHelper.mergeConfig(buildConfig, config.overrides.all);

    return buildConfig;
};
