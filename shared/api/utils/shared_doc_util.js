import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";

import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedDocUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);

        this.opdocsFilename = this._cables.getOpDocsFile();
        this.opLookupFilename = this._cables.getOpLookupFile();

        this._rebuildOpDocCache = true;
        this.cachedOpDocs = null;
        this.cachedLookup = null;

        fs.watch(this.opdocsFilename, () =>
        {
            jsonfile.readFile(this.opdocsFilename, (err, data) =>
            {
                if (!err && data)
                {
                    this._log.info("reloaded opdocs cache json file!");
                    this.cachedOpDocs = data;
                }
            });
        });

        fs.watch(this.opLookupFilename, () =>
        {
            jsonfile.readFile(this.opLookupFilename, (err, data) =>
            {
                if (!err && data) this.cachedLookup = data;
            });
        });
    }

    get utilName()
    {
        return UtilProvider.DOCS_UTIL;
    }

    getDocForOp(opName, docs = null)
    {
        if (!opName) return null;
        if (!this._opsUtil.isOpNameValid(opName)) return null;

        if (this._opsUtil.isCoreOp(opName))
        {
            if (!docs) docs = this.getOpDocs();
            for (let i = 0; i < docs.length; i++)
            {
                if (docs[i].name === opName)
                {
                    return docs[i];
                }
            }
            const fromFile = this.getOpDocsFromFile(opName);
            if (fromFile) fromFile.name = opName;
            return fromFile;
        }
        else
        {
            let collectionDocs = [];
            const collection = this._opsUtil.getCollectionName(opName);
            collectionDocs = this.getCollectionOpDocs(collection);
            let opDocs = collectionDocs.find((doc) => { return doc.name === opName; });
            if (!opDocs)
            {
                const fromFile = this.getOpDocsFromFile(opName);
                if (fromFile) fromFile.name = opName;
                opDocs = fromFile;
            }
            return opDocs;
        }
    }

    getOpDocsFromFile(opName)
    {
        const p = this._opsUtil.getOpAbsoluteJsonFilename(opName);
        try
        {
            const o = jsonfile.readFileSync(p);
            if (o) return o;
        }
        catch (e) {}
        return null;
    }

    getOpDocMd(opname)
    {
        if (this._opsUtil.isOpNameValid(opname))
        {
            const opPath = this._opsUtil.getOpAbsolutePath(opname);
            if (opPath)
            {
                const fn = path.join(opPath, opname + ".md");

                try
                {
                    return fs.readFileSync(fn, "utf8");
                }
                catch (e) { return null; }
            }
        }
        return null;
    }

    getCoreLibs(project)
    {
        if (!project || !project.ops) return [];
        let coreLibs = [];
        let usedOpsNames = {};
        project.ops.forEach((op) =>
        {
            usedOpsNames[op.opId] = this._opsUtil.getOpNameById(op.opId);
        });
        usedOpsNames = Object.values(usedOpsNames);
        for (let i = 0; i < usedOpsNames.length; i++)
        {
            const opName = usedOpsNames[i];
            if (this._opsUtil.isOpNameValid(opName))
            {
                const filename = this._opsUtil.getOpJsonPath(opName);
                try
                {
                    const obj = jsonfile.readFileSync(filename);
                    if (obj.coreLibs) coreLibs = coreLibs.concat(obj.coreLibs);
                }
                catch (ex) { if (!fs.existsSync(filename)) this._log.error("no ops meta info found", opName, filename); }
            }
        }
        coreLibs = this._helperUtil.uniqueArray(coreLibs);
        return coreLibs;
    }

    getProjectOpDependencies(project)
    {
        if (!project || !project.ops) return [];

        let projectDependencies = [];
        let usedOpsNames = {};
        project.ops.forEach((op) =>
        {
            usedOpsNames[op.opId] = this._opsUtil.getOpNameById(op.opId);
        });
        let subPatchOps = this._subPatchOpUtil.getOpsUsedInSubPatches(project);
        subPatchOps.forEach((op) =>
        {
            usedOpsNames[op.opId] = this._opsUtil.getOpNameById(op.opId);
        });
        usedOpsNames = Object.values(usedOpsNames);
        const opDocs = this.getOpDocsForCollections(usedOpsNames);
        let allDocs = null;
        for (let i = 0; i < opDocs.length; i++)
        {
            const opDoc = opDocs[i];
            if (!opDoc.name || !usedOpsNames.includes(opDoc.name)) continue;
            if (opDoc.dependencies)
            {
                const opDeps = opDoc.dependencies.filter((dep) => { return dep.type && dep.type !== "npm"; });
                for (let j = 0; j < opDeps.length; j++)
                {
                    const dep = opDeps[j];
                    if (!projectDependencies.some((projectDependency) => { return projectDependency.src === dep.src; }))
                    {
                        if (dep.type === "op")
                        {
                            const opName = this._opsUtil.getOpNameById(dep.src) || dep.src;
                            if (this._opsUtil.isOpNameValid(opName))
                            {
                                if (!allDocs) allDocs = this.getOpDocs();
                                const dependencyDoc = this.getDocForOp(opName, allDocs);
                                if (dependencyDoc && dependencyDoc.dependencies)
                                {
                                    // do we need recursion here?!
                                    dependencyDoc.dependencies.filter((d) => { return d.type && d.type !== "npm" && d.type !== "op"; }).forEach((opDep) =>
                                    {
                                        if (!projectDependencies.some((projectDependency) => { return projectDependency.src === opDep.src; }))
                                        {
                                            const dependencyDep = {
                                                "type": opDep.type,
                                                "src": opDep.src,
                                                "op": dependencyDoc.name,
                                                "opId": dependencyDoc.id
                                            };
                                            if (opDep.export) dependencyDep.export = opDep.export;
                                            projectDependencies.push(dependencyDep);
                                        }
                                    });
                                }
                            }
                        }
                        else
                        {
                            const opDep = {
                                "type": dep.type,
                                "src": dep.src,
                                "op": opDoc.name,
                                "opId": opDoc.id
                            };
                            if (dep.export) opDep.export = dep.export;
                            projectDependencies.push(opDep);
                        }

                    }
                }
            }
        }
        return projectDependencies;
    }

    getOpDocs(filterOldVersions, filterDeprecated)
    {
        let opDocs = [];
        if (this._rebuildOpDocCache)
        {
            let rebuildOpName = null;
            if (this._rebuildOpDocCache !== true) rebuildOpName = this._rebuildOpDocCache;
            this._rebuildOpDocCache = false;

            try
            {
                const dir = fs.readdirSync(this._cables.getCoreOpsPath());

                const nameLookup = {};
                const idLookup = {};

                for (const i in dir)
                {
                    const opName = dir[i];
                    if (!this._opsUtil.isOpNameValid(opName)) continue;

                    let opDoc = null;
                    if (!rebuildOpName)
                    {
                        opDoc = this.buildOpDocs(opName);
                    }
                    else
                    {
                        if (opName === rebuildOpName)
                        {
                            opDoc = this.buildOpDocs(opName);
                        }
                        else
                        {
                            if (this.getCachedOpLookup())
                            {
                                opDoc = this.getDocForOp(opName, this.cachedOpDocs.opDocs);
                                if (!opDoc) opDoc = this.buildOpDocs(opName);
                            }
                        }
                    }
                    if (opDoc)
                    {
                        opDocs.push(opDoc);
                        const opid = opDoc.id;
                        if (opid)
                        {
                            if (!nameLookup.hasOwnProperty(opName))
                            {
                                nameLookup[opName] = opid;
                            }
                            else
                            {
                                this._log.error("DUPLICATE OP NAME:", opName, opid);
                            }

                            if (!idLookup.hasOwnProperty(opid))
                            {
                                idLookup[opid] = opName;
                            }
                            else
                            {
                                this._log.error("DUPLICATE OP ID:", opid, opName, idLookup[opid]);
                            }
                        }
                        else
                        {
                            this._log.error("NO OP ID", opName);
                        }
                    }
                }

                opDocs = this._opsUtil.addVersionInfoToOps(opDocs, true);
                const newCache = {
                    "generated": Date.now(),
                    "opDocs": opDocs
                };

                jsonfile.writeFileSync(this.opdocsFilename, newCache);

                this.cachedOpDocs = newCache;
                let filteredOpDocs = [];
                if (filterDeprecated || filterOldVersions)
                {
                    for (let i = 0; i < opDocs.length; i++)
                    {
                        const opDoc = opDocs[i];
                        if (filterOldVersions && opDoc.oldVersion) continue;
                        if (filterDeprecated && this._opsUtil.isDeprecated(opDoc.name)) continue;
                        filteredOpDocs.push(opDoc);
                    }
                }
                else
                {
                    filteredOpDocs = opDocs;
                }
                return filteredOpDocs;
            }
            catch (e)
            {
                this._rebuildOpDocCache = true;
                this._log.warn("failed to rebuild opdoc cache", e);
            }
        }
        else
        {
            if (this.cachedOpDocs && this.cachedOpDocs.opDocs)
            {
                this.cachedOpDocs.opDocs = this._opsUtil.addVersionInfoToOps(this.cachedOpDocs.opDocs);
                let filteredOpDocs = [];
                if (filterDeprecated || filterOldVersions)
                {
                    for (let i = 0; i < this.cachedOpDocs.opDocs.length; i++)
                    {
                        const opDoc = this.cachedOpDocs.opDocs[i];
                        if (filterOldVersions && opDoc.oldVersion) continue;
                        if (filterDeprecated && this._opsUtil.isDeprecated(opDoc.name)) continue;
                        filteredOpDocs.push(opDoc);
                    }
                }
                else
                {
                    filteredOpDocs = this.cachedOpDocs.opDocs;
                }
                return filteredOpDocs;
            }
            else
            {
                this._rebuildOpDocCache = true;
                return this.getOpDocs(filterOldVersions, filterDeprecated);
            }
        }
    }

    getCachedOpLookup(updateCache = true)
    {
        if (!this.cachedLookup)
        {
            const emptyLookup = { "names": {}, "ids": {} };
            try
            {
                let removeOps = [];
                let fileLookUp = null;
                try
                {
                    fileLookUp = jsonfile.readFileSync(this.opLookupFilename);
                }
                catch (e)
                {
                    this._log.warn("error reading oplookup file", this.opLookupFilename, e.message);
                    fileLookUp = emptyLookup;
                }
                if (fileLookUp && fileLookUp.ids && fileLookUp.names)
                {
                    const idsAndNames = {};

                    const allOpNames = Object.keys(fileLookUp.names);
                    for (let j = 0; j < allOpNames.length; j++)
                    {
                        const currentOpName = allOpNames[j];
                        const idForCurrentName = fileLookUp.names[currentOpName];
                        if (!idsAndNames.hasOwnProperty(idForCurrentName)) idsAndNames[idForCurrentName] = [];
                        idsAndNames[idForCurrentName].push(currentOpName);
                    }

                    const idsWithNames = Object.keys(idsAndNames);
                    for (let i = 0; i < idsWithNames.length; i++)
                    {
                        const opId = idsWithNames[i];
                        const opNamesForId = idsAndNames[opId];
                        for (let j = 0; j < opNamesForId.length; j++)
                        {
                            const opName = opNamesForId[j];
                            if (!this._opsUtil.opExists(opName, false))
                            {
                                removeOps.push(opName);
                            }

                            if (fileLookUp.ids[opId] !== opName)
                            {
                                removeOps.push(opName);
                            }
                        }
                    }
                }
                this.cachedLookup = fileLookUp;
                if (updateCache) this.removeOpNamesFromLookup(removeOps);
            }
            catch (e)
            {
                this.cachedLookup = emptyLookup;
            }

        }
        return this.cachedLookup;
    }

    addOpToLookup(opId, opName)
    {
        this.addOpsToLookup([{ "id": opId, "name": opName }]);
    }

    removeOpNamesFromLookup(opNames)
    {
        if (!opNames) return;
        let changed = false;
        if (opNames.length === 0)
        {
            return;
        }
        else
        {
            this._log.info("removing", opNames.length, "ops from lookup table:", opNames.slice(0, 4).join(","), opNames.length > 5 ? "..." : "");
        }
        const cachedLookup = this.getCachedOpLookup(false);
        for (let i = 0; i < opNames.length; i++)
        {
            const opName = opNames[i];
            if (!opName) continue;
            if (!cachedLookup || !cachedLookup.ids || !cachedLookup.names)
            {
                this._log.warn("no cache of op lookup table during rename!");
                continue;
            }
            let opId = null;
            if (cachedLookup.names[opName])
            {
                opId = cachedLookup.names[opName];
            }

            if (opId)
            {
                delete cachedLookup.ids[opId];
                delete cachedLookup.names[opName];
                changed = true;
            }
        }
        if (changed)
        {
            jsonfile.writeFileSync(this._cables.getOpLookupFile(), cachedLookup);
        }
    }

    removeOpNameFromLookup(opName)
    {
        if (!opName) return;
        this.removeOpNamesFromLookup([opName]);
    }

    addOpsToLookup(ops, clearFiles = false, haltOnError = false)
    {
        if (!ops || ops.length === 0) return;
        if (clearFiles) this._log.info("rewriting caches with", ops.length, "ops");
        let cachedLookup = this.getCachedOpLookup(false);
        if (clearFiles || !cachedLookup) cachedLookup = {};
        if (clearFiles || !cachedLookup.ids) cachedLookup.ids = {};
        if (clearFiles || !cachedLookup.names) cachedLookup.names = {};
        ops.forEach((op) =>
        {
            if (op && op.name && op.id)
            {
                let error = false;
                if (cachedLookup.ids[op.id] && cachedLookup.ids[op.id] !== op.name)
                {
                    this._log.warn("DUPLICATE OP ID", op.id, op.name, cachedLookup.ids[op.id]);
                    error = true;
                }
                if (cachedLookup.names[op.name] && cachedLookup.names[op.name] !== op.id)
                {
                    this._log.warn("DUPLICATE OP NAME", op.name, op.id, cachedLookup.names[op.names]);
                    error = true;
                }
                if (error && haltOnError) throw new Error("OP LOOKUP CONSISTENCY ERROR!" + op.id + " " + op.name + " " + cachedLookup.ids[op.id]);
                cachedLookup.ids[op.id] = op.name;
                cachedLookup.names[op.name] = op.id;
            }
        });
        jsonfile.writeFile(this._cables.getOpLookupFile(), cachedLookup);
    }

    replaceOpNameInLookup(oldName, newName)
    {
        if (!oldName || !newName) return;
        let cachedLookup = this.getCachedOpLookup(false);
        if (!cachedLookup || !cachedLookup.ids || !cachedLookup.names)
        {
            this._log.warn("no cache of op lookup table during rename!");
            return;
        }
        let opId = null;
        if (cachedLookup.names[oldName]) opId = cachedLookup.names[oldName];
        if (opId)
        {
            cachedLookup.ids[opId] = newName;
            delete cachedLookup.names[oldName];
            cachedLookup.names[newName] = opId;
            jsonfile.writeFileSync(this._cables.getOpLookupFile(), cachedLookup);
        }
    }

    buildOpDocs(opName)
    {
        let docObj = null;

        docObj = {
            "name": opName,
            "content": ""
        };

        const dirName = this._opsUtil.getOpSourceDir(opName);
        docObj.attachmentFiles = this._opsUtil.getAttachmentFiles(opName) || [];

        const jsonFilename = path.join(dirName, opName + ".json");

        const parts = opName.split(".");
        const shortName = parts[parts.length - 1];

        if (!shortName) this._log.warn("no shortname ?", parts);

        parts.pop();
        const namespace = parts.join(".");

        let js = {};
        try
        {
            js = jsonfile.readFileSync(jsonFilename);
        }
        catch (e)
        {
            if (fs.existsSync(jsonFilename)) this._log.warn("failed to read opdocs from file", opName, jsonFilename, e);
        }

        if (js)
        {
            docObj = { ...docObj, ...this.makeImportable(js) };

            docObj.shortName = shortName;
            docObj.namespace = namespace;
            docObj.name = opName;
            docObj.nameNoVersion = this._opsUtil.getOpNameWithoutVersion(opName);
            docObj.shortNameDisplay = this._opsUtil.getOpNameWithoutVersion(shortName);
            docObj.version = this._opsUtil.getVersionFromOpName(opName);
            docObj.hasPublicRepo = this._opsUtil.isCoreOp(opName) || this._opsUtil.isExtension(opName);
            docObj.hidden = (this._opsUtil.isDeprecated(opName));
        }

        const mdFile = path.join(dirName, opName + ".md");
        try
        {
            const mdFileContent = fs.readFileSync(mdFile);
            if (mdFileContent)
            {
                docObj.content = mdFileContent.toString();
            }
            else
            {
                docObj.content = "";
            }
        }
        catch (e) {}
        return docObj;
    }

    getExtensionOpDocs(extensionName, currentUser)
    {
        let opDocs = [];
        const dirName = this._opsUtil.getExtensionDir(extensionName);
        if (fs.existsSync(dirName))
        {
            const opNames = this._opsUtil.getCollectionOpNames(extensionName);
            opDocs = this._opsUtil.addOpDocsForCollections(opNames, opDocs);
            opDocs = this._opsUtil.addVersionInfoToOps(opDocs);
            opDocs = this._opsUtil.addPermissionsToOps(opDocs, currentUser);
        }
        return opDocs;
    }

    getCollectionOpDocs(collectionName, currentUser = null, opNames = null)
    {
        let opDocs = [];
        if (!collectionName) return opDocs;
        collectionName = this._opsUtil.getCollectionName(collectionName);
        if (this._opsUtil.isCoreOp(collectionName))
        {
            opDocs = this.getOpDocs().filter((opDoc) => { return opDoc.name.startsWith(collectionName); });
        }
        else
        {
            if (!opNames)
            {
                const docFile = this._opsUtil.getCollectionOpDocFile(collectionName);
                if (fs.existsSync(docFile))
                {
                    opNames = this._opsUtil.getCollectionOpNames(collectionName);
                }
            }
            opDocs = this._opsUtil.addOpDocsForCollections(opNames, opDocs);
        }
        opDocs = this._opsUtil.addVersionInfoToOps(opDocs);
        if (currentUser) opDocs = this._opsUtil.addPermissionsToOps(opDocs, currentUser);
        return opDocs;
    }

    hasScreenshot(opname, opDocs)
    {
        if (!opDocs)
        {
            this._log.warn("hasScreenshot: no opDocs");
            return false;
        }
        for (const i in opDocs)
        {
            if (opDocs[i].name === opname && opDocs[i].hasScreenshot) return true;
        }
        return false;
    }

    hasExample(opname, opDocs)
    {
        const exampleId = this.getExampleProjectId(opname, opDocs);
        return !!exampleId;
    }

    getExampleProjectId(opname, opDocs)
    {
        if (!this._opsUtil.isOpNameValid(opname)) return null;

        if (!opDocs)
        {
            this._log.warn("getExampleProjectId: no opDocs");
            return null;
        }
        if (this._opsUtil.isCoreOp(opname))
        {
            for (const i in opDocs)
            {
                if (opDocs[i].name === opname && opDocs[i].exampleProjectId) return opDocs[i].exampleProjectId;
            }
        }
        else
        {
            const opsFile = this._opsUtil.getOpAbsoluteJsonFilename(opname);
            try
            {
                const otherDocs = jsonfile.readFileSync(opsFile);
                if (otherDocs && otherDocs.exampleProjectId) return otherDocs.exampleProjectId;
            }
            catch (e) {}
        }
        return null;
    }

    updateOpDocs(opName)
    {
        if (!opName || this._opsUtil.isCoreOp(opName))
        {
            this._rebuildOpDocCache = opName || true;
            return this.getOpDocs();
        }
        else
        {
            const collectionName = this._opsUtil.getCollectionName(opName);
            return this._opsUtil.buildOpDocsForCollection(collectionName, [opName]);
        }
    }

    cleanOpDocData(obj)
    {
        // remove empty strings etc from array:
        delete obj.name;
        delete obj.collections;
        delete obj.todos;
        if (obj.youtubeids) delete obj.youtubeid;
        if (obj.youtubeids) obj.youtubeids = obj.youtubeids.filter(Boolean);
        if (obj.relatedops)
        {
            for (let i = 0; i < obj.relatedops.length; i++)obj.relatedops[i] = obj.relatedops[i].trim();
            obj.relatedops = obj.relatedops.filter(Boolean);
            if (!obj.relatedops || obj.relatedops.length === 0)
            {
                delete obj.relatedops;
            }
        }
        if (obj.dependencies && obj.dependencies.length === 0) delete obj.dependencies;
        return this._helperUtil.cleanJson(obj);
    }

    makeReadable(opDocs)
    {
        // dereference array, so we do not alter cached values
        const cleanDocs = this._helperUtil.copy(opDocs);
        cleanDocs.forEach((opDoc) =>
        {
            delete opDoc.changelog;
            if (!opDoc.version) delete opDoc.version;
            delete opDoc.versionString;
            delete opDoc.nameNoVersion;
            delete opDoc.relatedops;
            delete opDoc.collections;
            if (opDoc.newestVersion && (opDoc.newestVersion.name === opDoc.name))
            {
                delete opDoc.newestVersion;
            }
            if (opDoc.dependencies)
            {
                opDoc.dependencies.forEach((dep) =>
                {
                    if (dep.type === "op")
                    {
                        dep.opName = this._opsUtil.getOpNameById(dep.src);
                        const depDocs = this.getDocForOp(dep.opName);
                        if (depDocs && depDocs.oldVersion)
                        {
                            dep.oldVersion = depDocs.oldVersion;
                            dep.newestVersion = depDocs.newestVersion || {};
                            dep.newestVersion.opId = depDocs.id;
                        }
                    }
                });
            }
        });
        return cleanDocs;
    }

    makeImportable(opDoc)
    {
        if (!opDoc) return {};
        const docObj = {};

        docObj.summary = opDoc.summary || "";
        docObj.id = opDoc.id;
        docObj.layout = opDoc.layout;
        docObj.ports = opDoc.ports;
        docObj.authorName = opDoc.authorName || "unknown";
        docObj.docs = opDoc.docs;
        docObj.license = opDoc.license;
        docObj.hasExample = !!opDoc.exampleProjectId;
        docObj.libs = opDoc.libs || [];
        docObj.youtubeids = opDoc.youtubeids || [];
        docObj.created = opDoc.created;
        docObj.exampleProjectId = opDoc.exampleProjectId || "";
        if (opDoc.credits) docObj.credits = opDoc.credits;
        if (opDoc.changelog) docObj.changelog = opDoc.changelog;
        if (opDoc.todos) docObj.todos = opDoc.todos;
        if (opDoc.coreLibs) docObj.coreLibs = opDoc.coreLibs;
        if (opDoc.dependencies && opDoc.dependencies.length > 0) docObj.dependencies = opDoc.dependencies;
        if (opDoc.issues) docObj.issues = opDoc.issues;
        if (opDoc.caniusequery) docObj.caniusequery = opDoc.caniusequery;
        if (opDoc.cloneOf) docObj.cloneOf = opDoc.cloneOf;

        return docObj;
    }

    getAllExtensionDocs(filterOldVersions = false, filterDeprecated = false, publicOnly = true)
    {
        const collectionPath = this._cables.getExtensionOpsPath();
        const extensions = [];
        if (collectionPath)
        {
            let exDirs = [];
            try
            {
                exDirs = fs.readdirSync(collectionPath);
            }
            catch (e) {}
            exDirs.forEach((extensionName) =>
            {
                if (!publicOnly)
                {
                    const extensionOps = this._opsUtil.getCollectionOpNames(extensionName);
                    if (extensionOps.length > 0)
                    {
                        const extDocs = this.getExtensionDoc(extensionName, filterOldVersions, filterDeprecated);
                        if (extDocs) extensions.push(extDocs);
                    }
                }
                else if (this._opsUtil.isExtension(extensionName) && this._opsUtil.getCollectionVisibility(extensionName) === this._opsUtil.VISIBILITY_PUBLIC)
                {
                    const extensionOps = this._opsUtil.getCollectionOpNames(extensionName);
                    if (extensionOps.length > 0)
                    {
                        const extDocs = this.getExtensionDoc(extensionName, filterOldVersions, filterDeprecated);
                        if (extDocs) extensions.push(extDocs);
                    }
                }
            });
        }

        return extensions;
    }

    getExtensionDoc(extensionName, filterOldVersions = false, filterDeprecated = false)
    {
        const extensionOps = this._opsUtil.getCollectionOpNames(extensionName);
        const shortName = this._opsUtil.getExtensionShortName(extensionName);
        return this._getNamespaceDocs(extensionName, shortName, null, extensionOps, filterOldVersions, filterDeprecated);
    }

    rebuildOpCaches(cb, scopes = ["core"], clearFiles = false, haltOnError = false)
    {
        // do this in a separate thread to not block the main-loop
        setTimeout(() =>
        {
            const start = Date.now();
            let opCount = 0;
            this._rebuildOpDocCache = true;

            const coreDocs = this.getOpDocs();
            let docs = [];
            if (scopes.includes("core"))
            {
                docs = coreDocs;
                opCount += coreDocs.length;
                this._log.info("updating", coreDocs.length, "ops in core");
                this.addOpsToLookup(docs, clearFiles, haltOnError);
            }

            let extensionOps = [];
            if (scopes.includes("extensions"))
            {
                extensionOps = this._opsUtil.getAllExtensionOpNames();
                opCount += extensionOps.length;
            }

            let teamOps = [];
            if (scopes.includes("teams"))
            {
                teamOps = this._opsUtil.getAllTeamOpNames();
                opCount += teamOps.length;
            }

            let userOps = [];
            if (scopes.includes("users"))
            {
                userOps = this._opsUtil.getAllUserOpNames();
                opCount += userOps.length;
            }

            let patchOps = [];
            if (scopes.includes("patches"))
            {
                patchOps = this._opsUtil.getAllPatchOpNames();
                opCount += patchOps.length;
            }

            Promise.all([
                this._updateOpCache("extensions", extensionOps),
                this._updateOpCache("teams", teamOps),
                this._updateOpCache("users", userOps),
                this._updateOpCache("patches", patchOps)
            ]).then((collectionDocs) =>
            {
                collectionDocs.forEach((opDocs) =>
                {
                    docs = docs.concat(opDocs);
                });
                const end = Date.now();
                const duration = (end - start);
                this._log.info("updating", opCount, "ops took " + duration / 1000 + "s");
                this._log.event(null, "server", "opcache", "rebuild", { "count": opCount, "duration": duration, "scopes": scopes });
                if (cb) cb(docs);
            });
        }, 1000);

    }

    async _updateOpCache(title, opNames, clearFiles, haltOnError)
    {
        if (opNames.length === 0) return [];
        this._log.info("updating", opNames.length, "ops in", title);
        let docs = [];
        let collections = {};
        opNames.forEach((opName) =>
        {
            if (opName)
            {
                const collection = this._opsUtil.getCollectionName(opName);
                if (!collections.hasOwnProperty(collection)) collections[collection] = [];
                collections[collection].push(opName);
            }
        });

        for (const collection in collections)
        {
            const collectionOpNames = collections[collection];
            docs = docs.concat(this._opsUtil.buildOpDocsForCollection(collection, collectionOpNames, collectionOpNames, false));
        }

        // make sure all ops are in lookup table, since we skipped adding individual ones in the line above
        this.addOpsToLookup(docs, clearFiles, haltOnError);
        return docs;
    }

    getOpDocsForCollections(opNames, currentUser)
    {
        let opDocs = [];
        let collections = {};
        opNames.forEach((extOp) =>
        {
            const collection = this._opsUtil.getCollectionName(extOp);
            if (!collections.hasOwnProperty(collection)) collections[collection] = [];
            collections[collection].push(extOp);
        });
        for (let collection in collections)
        {
            const collectionOpName = collections[collection];
            opDocs = opDocs.concat(this.getCollectionOpDocs(collection, currentUser, collectionOpName));
        }
        return opDocs;
    }

    _getNamespaceDocs(namespaceName, shortName, team, opNames = [], filterOldVersions = false, filterDeprecated = false)
    {
        if (opNames && (filterOldVersions || filterDeprecated))
        {
            let opDocs = this._docsUtil.getOpDocsForCollections(opNames);
            opDocs = this._opsUtil.addVersionInfoToOps(opDocs);
            if (filterDeprecated) opNames = opNames.filter((opName) => { return !this._opsUtil.isDeprecated(opName); });
            if (filterOldVersions) opNames = opNames.filter((opName) =>
            {
                return !this._opsUtil.isOpOldVersion(opName, opDocs);
            });
        }
        let extDocs = {
            "name": namespaceName,
            "summary": "",
            "shortName": shortName,
            "nameSpace": namespaceName,
            "shortNameDisplay": shortName,
            "numOps": opNames.length,
            "ops": opNames
        };
        if (team)
        {
            extDocs.teamName = team.name;
            extDocs.description = team.description;
            extDocs.teamLink = team.link;
        }

        const extInfo = this._opsUtil.getCollectionDocs(namespaceName);
        extDocs = { ...extDocs, ...extInfo };

        return extDocs;
    }

    getProjectLibs(project)
    {
        if (!project || !project.ops) return [];
        let libs = [];
        let usedOpsNames = {};
        project.ops.forEach((op) =>
        {
            usedOpsNames[op.opId] = this._opsUtil.getOpNameById(op.opId);
        });
        usedOpsNames = Object.values(usedOpsNames);
        for (let i = 0; i < usedOpsNames.length; i++)
        {
            const opName = usedOpsNames[i];
            if (this._opsUtil.isOpNameValid(opName))
            {
                const filename = this._opsUtil.getOpJsonPath(opName);
                try
                {
                    const obj = jsonfile.readFileSync(filename);
                    if (obj.libs)libs = libs.concat(obj.libs);
                }
                catch (ex) { if (fs.existsSync(filename)) this._log.error("no ops meta info found", opName, filename); }
            }
        }
        libs = this._helperUtil.uniqueArray(libs);
        return libs;
    }
}
