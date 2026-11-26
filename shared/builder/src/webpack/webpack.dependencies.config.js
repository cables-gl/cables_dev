import { createRequire } from "module";
import path from "path";
import jsonfile from "jsonfile";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import CablesWebpackHelper from "./webpack.helper.js";


// loaders are resolved from this package, not from the folder webpack runs in
const loaderPath = createRequire(import.meta.url).resolve;
/**
 * @param {import("./webpack.config").CablesWebpackConfig} config
 * @param {Object} patchJson
 * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
 */
export default (config, patchJson, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling dependencies");

    const targetDir = CablesWebpackHelper.getJsDir(config);
    const buildMode = config.mode || "production";
    const minify = config.options?.hasOwnProperty("minify") ? config.options?.minify : true;

    fs.mkdirSync(targetDir, { "recursive": true });

    // only look for checkouts when libs are not given as folders
    let libsDir = config.options?.libsDir ? path.resolve(config.options.libsDir) : null;
    const corelibsDir = config.options?.corelibsDir ? path.resolve(config.options.corelibsDir) : null;

    // collect opdependencies
    const opJsonFiles = CablesWebpackHelper.getOps().map((op) => { return path.join(op.dir, op.name + ".json"); });

    let coreLibs = [];
    opJsonFiles.forEach((file) =>
    {
        const opJson = jsonfile.readFileSync(file);
        if (opJson.libs)
        {
            opJson.libs.forEach((lib) =>
            {
                if (!libsDir) libsDir = path.join(CablesWebpackHelper.getDevDir(config), "shared", "libs");
                const sourceFile = path.resolve(libsDir, lib);
                const targetFile = path.resolve(targetDir, lib);
                fs.copyFileSync(sourceFile, targetFile);
                CablesWebpackHelper.addOpDependency(lib);
            });
        }
        if (opJson.dependencies)
        {
            for (let i = 0; i < opJson.dependencies.length; i++)
            {
                const dependency = opJson.dependencies[i];
                const validTypes = ["commonjs", "module"];
                if (validTypes.includes(dependency.type))
                {
                    const isRemote = /^https?:\/\//i.test(dependency.src);
                    if (!isRemote)
                    {
                        const sourceFile = path.resolve(path.dirname(file), dependency.src);
                        const targetFile = path.resolve(targetDir, dependency.src);
                        fs.copyFileSync(sourceFile, targetFile);
                        CablesWebpackHelper.addOpDependency(path.basename(dependency.src), dependency.type, dependency.export);
                    }
                }
            }
        }
        if (opJson.coreLibs)
        {
            coreLibs = coreLibs.concat(opJson.coreLibs);
            CablesWebpackHelper.addCoreLibs(coreLibs);
        }
    });

    coreLibs = [...new Set(coreLibs)];
    if (coreLibs.length === 0) return [];

    // already built corelibs are copied, like libs
    if (corelibsDir)
    {
        coreLibs.forEach((namespace) =>
        {
            const sourceFile = path.join(corelibsDir, namespace + ".js");
            if (!fs.existsSync(sourceFile)) throw new Error("corelib " + namespace + " not found in " + corelibsDir);
            fs.copyFileSync(sourceFile, path.join(targetDir, namespace + ".js"));
        });
        return [];
    }
    const __coreDir = CablesWebpackHelper.getCoreDir(config);

    // corelibs build
    const getEntryFile = function (arr, namespace)
    {
        let entryFile = "index.js";
        const possibleEntryFiles = ["index.js", namespace + ".js"];
        const names = [];
        for (let i = 0; i < arr.length; i++)
        {
            const dirent = arr[i];
            const fileName = dirent.name;
            if (!dirent.isDirectory() && !fileName.startsWith(".") && fileName.endsWith(".js"))
            {
                names.push(dirent.name);
            }
        }
        if (names.includes("index.js"))
        {
            entryFile = "index.js";
        }
        else
        {
            entryFile = names.find((name) => { return possibleEntryFiles.includes(name); });
        }
        return entryFile;
    };

    /** @type {Object<String, Object>} */
    const entries = {};
    let needsThree = false;
    coreLibs.forEach((namespace) =>
    {
        const dirContent = fs.readdirSync(path.join(__coreDir, "src", "corelibs", namespace), { "withFileTypes": true });

        const namespaceEntryFile = getEntryFile(dirContent, namespace);
        const namespaceParts = namespace.split("_");

        let libraryNamespace = "CABLES";
        if (namespaceParts.length > 1)
        {
            libraryNamespace = "";
            namespaceParts.pop();
            namespaceParts.forEach((part, i) =>
            {
                if (i > 0) libraryNamespace += ".";
                libraryNamespace += part.toUpperCase();
            });
        }
        if (libraryNamespace.startsWith("THREE.")) needsThree = true;

        entries[namespace] = {
            "import": path.resolve(__coreDir, "src", "corelibs", namespace, namespaceEntryFile),
            "library": {
                "name": libraryNamespace.toUpperCase(),
                "type": "assign-properties"
            }
        };
    });

    const libraryExternals = {
        "cables": "CABLES",
        "cables-shared-client": "CABLES.SHARED"
    };
    if (needsThree) libraryExternals.three = "THREE";

    let plugins = [];
    if (config.plugins?.dependencies) plugins = plugins.concat(config.plugins.dependencies);
    if (config.plugins?.all) plugins = plugins.concat(config.plugins.all);

    let defaultConfig = {
        "name": "dependencies",
        "entry": entries,
        "output": {
            "path": targetDir,
            "filename": "[name].js"
        },
        "externals": libraryExternals,
        // core libs are a few KiB up to ~250 KiB (cgl), warn when one gets unusually big
        "performance": {
            "maxAssetSize": 1024 * 1024,
            "maxEntrypointSize": 1024 * 1024
        },
        "mode": buildMode,
        "devtool": (minify && config.options?.sourcemaps) ? "source-map" : false,
        "optimization": {
            "concatenateModules": true,
            "usedExports": true,
            "minimize": minify,
            "minimizer": [
                new TerserPlugin({
                    "extractComments": false,
                    "terserOptions": {
                        "format": {
                            "comments": false
                        }
                    }
                })
            ]
        },
        "module": {
            "rules": [
                {
                    "test": /\.frag/,
                    "use": loaderPath("raw-loader")
                },
                {
                    "test": /\.vert/,
                    "use": loaderPath("raw-loader")
                },
                {
                    "test": /\.wgsl/,
                    "use": loaderPath("raw-loader")
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ]
        },
        "plugins": plugins,
        "resolve": {
            "extensions": [".json", ".js", ".jsx"]
        }
    };

    if (config.overrides?.dependencies) defaultConfig = CablesWebpackHelper.mergeConfig(defaultConfig, config.overrides.dependencies);
    if (config.overrides?.all) defaultConfig = CablesWebpackHelper.mergeConfig(defaultConfig, config.overrides.all);

    return [defaultConfig];
};
