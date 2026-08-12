import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import jsonfile from "jsonfile";
import fs from "fs";
import CablesWebpackHelper from "./webpack.helper.js";

export default (patchJson, sourceDir, targetDir, buildMode, logger = null) =>
{
    if (!logger) logger = console;
    logger.info("assembling dependencies");

    fs.mkdirSync(targetDir, { "recursive": true });

    const __coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.resolve("cables"))), "..", "..");
    const __devDir = path.dirname(fileURLToPath(import.meta.resolve("cables_dev/package.json")));

    // collect opdependencies
    const opsJsonGlob = path.join(sourceDir, "./**/Ops.**.json");
    const opJsonFiles = glob.sync(opsJsonGlob);

    let coreLibs = [];
    opJsonFiles.forEach((file, i) =>
    {
        const opJson = jsonfile.readFileSync(file);
        if (opJson.libs)
        {
            opJson.libs.forEach((lib) =>
            {
                const sourceFile = path.resolve(__devDir, "shared", "libs", lib);
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

    coreLibs = CablesWebpackHelper.uniqueArray(coreLibs);
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

    const createOutputEntryObjectsNamespace = (namespace) =>
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

        const output = {
            "name": "dependencies_" + namespace,
            "entry": [
                path.join(__coreDir, "src", "corelibs", namespace, namespaceEntryFile)
            ],
            "output": {
                "path": targetDir,
                "library": {
                    "name": libraryNamespace.toUpperCase(),
                    "type": "assign-properties"
                }
            }
        };

        const libraryExternals = {
            "cables": "CABLES",
            "cables-shared-client": "CABLES.SHARED",
        };
        if (libraryNamespace.startsWith("THREE."))
        {
            libraryExternals.three = "THREE";
        }
        output.externals = libraryExternals;
        return output;
    };

    const entryAndOutputObjects = [];
    for (let i = 0; i < coreLibs.length; i++)
    {
        const namespace = coreLibs[i];
        entryAndOutputObjects.push(createOutputEntryObjectsNamespace(namespace));
    }

    const defaultConfig = {
        "mode": buildMode,
        "devtool": false,
        "optimization": {
            "concatenateModules": true,
            "usedExports": true
        },
        "module": {
            "rules": [
                {
                    "test": /\.frag/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.vert/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.wgsl/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.cables/,
                    "type": "json"
                }
            ],
        },
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
        },
    };

    const configs = [];
    for (let i = 0; i < entryAndOutputObjects.length; i++)
    {
        const entryAndOutput = entryAndOutputObjects[i];
        configs.push({ ...defaultConfig, ...entryAndOutput });
    }

    return configs;
};
