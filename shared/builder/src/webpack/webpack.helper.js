import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import deepmerge from "deepmerge";
import BuildUtil from "../build_util.js";

class CablesWebpackHelper
{

    constructor()
    {
        this._log = console;
        this._buildUtil = new BuildUtil(this._log);
        this._opLookUp = {
            "names": [],
            "ids": []
        };
        this._opDependencies = [];
        this._coreLibs = [];
        this._assets = { "replacements": {}, "files": [], "warnings": [] };
        this._opIdReplacements = {};
        this._ops = [];
    }

    /**
     * cables_dev checkout for shared/libs and shared/client, options.devDir or the repo this package is in
     *
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getDevDir(config)
    {
        if (config.options?.devDir) return config.options.devDir;
        const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
        if (fs.existsSync(path.join(repoDir, "shared", "libs"))) return repoDir;
        throw new Error("could not find cables_dev, set options.devDir");
    }

    /**
     * cables checkout to build core and corelibs from, options.coreDir or cables/ in the repo this package is in
     *
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getCoreDir(config)
    {
        if (config.options?.coreDir) return config.options.coreDir;
        const repoCoreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "cables");
        if (fs.existsSync(path.join(repoCoreDir, "src", "core"))) return repoCoreDir;
        throw new Error("could not find cables, set options.coreDir");
    }

    /**
     * finds the ops used in the patch and in its subpatch ops, in the ops folder of the export first, then in options.opsDirs,
     * the first dir that contains an op wins
     *
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @param {Object} patchJson
     */
    collectOps(config, patchJson)
    {
        const opsDirs = [path.join(path.resolve(path.dirname(config.entry)), "ops")];
        (config.options?.opsDirs || []).forEach((dir) => { opsDirs.push(path.resolve(dir)); });

        // op folders are named like their op, so they can be found without reading every op json
        /** @type {Object<String, String>} */
        const opDirsByName = {};
        const findOpDirs = (dir) =>
        {
            let entries = [];
            try
            {
                entries = fs.readdirSync(dir, { "withFileTypes": true });
            }
            catch (e)
            {
                return;
            }
            const dirName = path.basename(dir);
            if (dirName.startsWith("Ops.") && entries.some((entry) => { return entry.isFile() && entry.name === dirName + ".json"; }))
            {
                if (!opDirsByName.hasOwnProperty(dirName)) opDirsByName[dirName] = dir;
                return;
            }
            entries.forEach((entry) =>
            {
                if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) findOpDirs(path.join(dir, entry.name));
            });
        };
        opsDirs.forEach(findOpDirs);

        const readOpJson = (opName) =>
        {
            try
            {
                return JSON.parse(fs.readFileSync(path.join(opDirsByName[opName], opName + ".json"), "utf8"));
            }
            catch (e)
            {
                return null;
            }
        };

        // only needed for ops without a name, reads the json of every op once
        /** @type {Object<String, String>} */
        let opNamesById = null;
        const findOpNameById = (opId) =>
        {
            if (!opNamesById)
            {
                opNamesById = {};
                Object.keys(opDirsByName).forEach((opName) =>
                {
                    const opJson = readOpJson(opName);
                    if (opJson && opJson.id && !opNamesById.hasOwnProperty(opJson.id)) opNamesById[opJson.id] = opName;
                });
            }
            return opNamesById[opId];
        };

        /** @type {{name: String, id: String, dir: String}[]} */
        const ops = [];
        /** @type {String[]} */
        const missing = [];
        const addOps = (patch) =>
        {
            if (!patch || !patch.ops) return;
            patch.ops.forEach((op) =>
            {
                let opName = null;
                let opJson = null;
                if (op.objName && opDirsByName.hasOwnProperty(op.objName))
                {
                    opJson = readOpJson(op.objName);
                    if (opJson && (!op.opId || opJson.id === op.opId)) opName = op.objName;
                }
                if (!opName && op.opId)
                {
                    opName = findOpNameById(op.opId);
                    opJson = opName ? readOpJson(opName) : null;
                }
                if (!opName || !opJson)
                {
                    const missingOp = op.objName ? op.objName + (op.opId ? " (" + op.opId + ")" : "") : op.opId;
                    if (missingOp && !missing.includes(missingOp)) missing.push(missingOp);
                    return;
                }
                if (ops.some((usedOp) => { return usedOp.name === opName; })) return;

                const opDir = opDirsByName[opName];
                ops.push({ "name": opName, "id": opJson.id, "dir": opDir });
                this.addOpToLookup(opJson.id, opName);

                const subPatchFile = path.join(opDir, BuildUtil.SUBPATCH_ATTACHMENT_NAME);
                if (fs.existsSync(subPatchFile))
                {
                    try
                    {
                        addOps(JSON.parse(fs.readFileSync(subPatchFile, "utf8")));
                    }
                    catch (e)
                    {
                        missing.push("ops of subpatch op " + opName + " (" + e.message + ")");
                    }
                }
            });
        };
        addOps(patchJson);

        if (missing.length > 0) throw new Error("ops not found in " + opsDirs.join(", ") + ":\n\n    - " + missing.join("\n    - ") + "\n");
        this._ops = ops;
    }

    /**
     * ops used in the patch and its subpatch ops, see collectOps
     *
     * @returns {{name: String, id: String, dir: String}[]}
     */
    getOps()
    {
        return this._ops;
    }

    /**
     * subpatch attachments of the used ops, sorted by path so op id replacements stay the same between builds
     *
     * @returns {String[]}
     */
    getSubPatchFiles()
    {
        return this._ops
            .map((op) => { return path.join(op.dir, BuildUtil.SUBPATCH_ATTACHMENT_NAME); })
            .filter((file) => { return fs.existsSync(file); })
            .map((file) => { return { "file": file, "key": file.split(path.sep).join("/") }; })
            .sort((a, b) => { return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0); })
            .map((entry) => { return entry.file; });
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @param {Object} patchJson
     */
    prepareOpIds(config, patchJson)
    {
        const combineJs = config.options?.hasOwnProperty("combinejs") ? config.options.combinejs : true;
        const subPatchFiles = this.getSubPatchFiles();
        const subPatches = subPatchFiles.map((subPatchFile) =>
        {
            try
            {
                return JSON.parse(fs.readFileSync(subPatchFile, "utf8"));
            }
            catch (e)
            {
                return null;
            }
        });
        this._opIdReplacements = this._buildUtil.getOpIdReplacements(patchJson, subPatches, combineJs);
    }

    /**
     * @returns {Object<String, String>}
     */
    getOpIdReplacements()
    {
        return this._opIdReplacements;
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getJsDir(config)
    {
        if (config.options?.flat) return config.output.path;
        return path.join(config.output.path, "js");
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getJsPath(config)
    {
        return this._buildUtil.getJsPath(config.options?.flat);
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getAssetDir(config)
    {
        if (config.options?.flat) return config.output.path;
        return path.join(config.output.path, "assets");
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getAssetPath(config)
    {
        return this._buildUtil.getAssetPath(config.options?.flat);
    }

    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @param {Object} patchJson
     */
    prepareAssets(config, patchJson)
    {
        const sourceDir = path.join(path.resolve(path.dirname(config.entry)), "assets");
        const assetPath = this.getAssetPath(config);

        /** @type {Object<String, String>} */
        const replacements = {};
        /** @type {{from: String, to: String}[]} */
        const files = [];
        /** @type {String[]} */
        const warnings = [];
        /** @type {String[]} */
        const names = [];

        const projectDir = path.resolve(path.dirname(config.entry));
        const libraryDir = config.options?.assetLibraryDir ? path.resolve(config.options.assetLibraryDir) : path.join(sourceDir, "library");
        /** @type {Object<String, String>} */
        const namesBySource = {};

        // projects that are not exports (e.g. from cables standalone) use paths relative to the project, absolute paths or file urls
        const getLocalFile = (value) =>
        {
            if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !value.startsWith("file:")) return null;
            let file = value;
            try
            {
                if (value.startsWith("file:")) file = fileURLToPath(value);
            }
            catch (e)
            {
                return null;
            }
            if (!path.isAbsolute(file) || (file.startsWith("/assets/") && !fs.existsSync(file))) file = path.resolve(projectDir, file.replace(/^\//, ""));
            return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
        };

        const addValue = (value) =>
        {
            if (replacements.hasOwnProperty(value)) return;

            let source = null;
            let name = null;
            const asset = this._buildUtil.getAssetName(value);
            if (asset && asset.file.startsWith("library/"))
            {
                source = path.join(libraryDir, asset.file.substring("library/".length));
                name = asset.name;
            }
            else if (asset && fs.existsSync(path.join(sourceDir, asset.file)))
            {
                source = path.join(sourceDir, asset.file);
                name = asset.name;
            }
            else
            {
                source = getLocalFile(value);
                if (source)
                {
                    const relative = path.relative(projectDir, source);
                    const inProject = !relative.startsWith("..") && !path.isAbsolute(relative);
                    name = (inProject ? relative : path.basename(source)).split(path.sep).join("_");
                    if (inProject && name.startsWith("assets_")) name = name.substring("assets_".length);
                }
            }

            if (!source || !fs.existsSync(source))
            {
                const isRemote = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !value.startsWith("file:");
                if (!isRemote && value !== "0") warnings.push("asset used in patch is missing: " + value);
                return;
            }

            if (namesBySource.hasOwnProperty(source))
            {
                replacements[value] = assetPath + namesBySource[source];
                return;
            }
            // different files with the same name get a number
            let uniqueName = name;
            for (let i = 1; names.includes(uniqueName); i++)
            {
                const ext = path.extname(name);
                uniqueName = name.substring(0, name.length - ext.length) + "_" + i + ext;
            }
            names.push(uniqueName);
            namesBySource[source] = uniqueName;
            replacements[value] = assetPath + uniqueName;
            files.push({ "from": source, "to": uniqueName });
        };

        this._buildUtil.getFilePortValues(patchJson).forEach(addValue);
        this.getSubPatchFiles().forEach((subPatchFile) =>
        {
            try
            {
                this._buildUtil.getFilePortValues(JSON.parse(fs.readFileSync(subPatchFile, "utf8"))).forEach(addValue);
            }
            catch (e)
            {
                warnings.push("failed to read subpatch " + subPatchFile + ": " + e.message);
            }
        });

        this._assets = { "replacements": replacements, "files": files, "warnings": warnings };
    }

    /**
     * @returns {Object<String, String>}
     */
    getAssetReplacements()
    {
        return this._assets.replacements;
    }

    /**
     * @returns {{from: String, to: String}[]}
     */
    getAssetFiles()
    {
        return this._assets.files;
    }

    /**
     * @returns {String[]}
     */
    getAssetWarnings()
    {
        return this._assets.warnings;
    }


    /**
     * @param {import("./webpack.config").CablesWebpackConfig} config
     * @returns {String}
     */
    getJsonFileName(config)
    {
        const givenName = config.options?.jsonfilename;
        if (givenName) return path.basename(givenName, path.extname(givenName)) + ".json";
        return path.basename(config.entry, ".cables") + ".json";
    }

    /**
     *
     * @template T
     * @param {T} target
     * @param {Object} source
     * @returns {T}
     */
    mergeConfig(target, source)
    {
        const isMergeable = (value) =>
        {
            if (Array.isArray(value)) return true;
            if (!value || typeof value !== "object") return false;
            const proto = Object.getPrototypeOf(value);
            return proto === Object.prototype || proto === null;
        };
        return deepmerge(target, source, { "isMergeableObject": isMergeable });
    }

    getOpDependencies()
    {
        return this._opDependencies;
    }

    addOpDependency(src, type = "commonjs", moduleExport = null)
    {
        const existingDependency = this._opDependencies.find((dep) => { return dep.src === src && dep.type === type && dep.export === moduleExport; });
        if (!existingDependency)
        {
            this._opDependencies.push({
                "src": src,
                "type": type,
                "export": moduleExport
            });
        }
    }

    getCoreLibs()
    {
        return this._coreLibs;
    }

    addCoreLib(coreLib)
    {
        if (!this._coreLibs.includes(coreLib))
        {
            this._coreLibs.push(coreLib);
        }
    }

    addCoreLibs(coreLibs)
    {
        coreLibs.forEach((coreLib) =>
        {
            this.addCoreLib(coreLib);
        });
    }

    addOpToLookup(opId, opName)
    {
        this._opLookUp.ids[opId] = opName;
        this._opLookUp.names[opName] = opId;
    }

    /**
     * @returns {Object<String, String>}
     */
    getOpLookupIds()
    {
        return this._opLookUp.ids;
    }

    getOpNameById(opId)
    {
        return this._opLookUp.ids[opId];
    }


    /**
     * copy of the patch with the objName of every op set from its opId,
     * .cables files and subpatch attachments only reliably have the opId, stored names can be outdated
     *
     * @param {Object} p
     * @returns {Object}
     */
    getPatchWithOpNames(p)
    {
        const project = JSON.parse(JSON.stringify(p));
        if (!project.ops) return project;
        project.ops.forEach((op) =>
        {
            if (op.opId)
            {
                const objName = this.getOpNameById(op.opId);
                if (objName) op.objName = objName;
                else delete op.objName;
            }
            else if (op.objName)
            {
                this._log.warn("NO OPID IN EXPORT", p.shortId, op.objName);
            }
        });
        return project;
    }

    makeExportable(p, keepAlso = [])
    {
        return this._buildUtil.makeExportable(this.getPatchWithOpNames(p), keepAlso);
    }

    removeEmptyChunk(name = "main.js")
    {
        return {
            "apply": function (compiler)
            {
                compiler.hooks.thisCompilation.tap("RemoveEmptyChunk", (compilation) =>
                {
                    compilation.hooks.processAssets.tapAsync(
                        {
                            "name": "RemoveEmptyChunk",
                            "stage": compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
                        },
                        (assets, callback) =>
                        {
                            for (const assetName of Object.keys(assets))
                            {
                                if (assetName.startsWith(name))
                                {
                                    delete assets[assetName];
                                }
                            }
                            callback();
                        }
                    );
                });
            }
        };
    }

}

export default new CablesWebpackHelper();
