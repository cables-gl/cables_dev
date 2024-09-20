import fs from "fs";
import jsonfile from "jsonfile";
import { marked } from "marked";
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
                this._log.info("reloaded opdocs cache json file!");
                this.cachedOpDocs = data;
            });
        });

        fs.watch(this.opLookupFilename, () =>
        {
            jsonfile.readFile(this.opLookupFilename, (err, data) =>
            {
                this.cachedLookup = data;
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
            if (!opDocs)
            {
                this._log.warn("could not find opdocs for", opName);
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
                const fn = opPath + opname + ".md";

                try
                {
                    if (fs.existsSync(fn))
                    {
                        return fs.readFileSync(fn, "utf8");
                    }
                    else
                    {
                        return null;
                    }
                }
                catch (e) {}
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
                const filename = this._opsUtil.getOpAbsolutePath(opName) + opName + ".json";
                try
                {
                    if (fs.existsSync(filename))
                    {
                        const obj = jsonfile.readFileSync(filename);
                        if (obj.coreLibs) coreLibs = coreLibs.concat(obj.coreLibs);
                    }
                }
                catch (ex) { this._log.error("no ops meta info found", opName, filename); }
            }
        }
        coreLibs = this._helperUtil.uniqueArray(coreLibs);
        return coreLibs;
    }

    setOpLinks(str)
    {
        str = str || "";
        // eslint-disable-next-line no-useless-escape
        const urlPattern = /\b(?:Ops\.)[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        str = str.replace(urlPattern, "<a href=\"/op/$&\" target=\"_blank\">$&</a>");
        return str;
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
                this._opsUtil.addVersionInfoToOps(this.cachedOpDocs.opDocs);
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

    getCachedOpLookup()
    {
        if (!this.cachedLookup)
        {
            if (fs.existsSync(this.opLookupFilename))
            {
                let removeOps = [];
                const fileLookUp = jsonfile.readFileSync(this.opLookupFilename);
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
                this.removeOpNamesFromLookup(removeOps);
            }
            else
            {
                this.cachedLookup = { "names": {}, "ids": {} };
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
        if (opNames.length > 0) this._log.info("removing", opNames.length, "ops from lookup table");
        const cachedLookup = this.getCachedOpLookup();
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
            this._log.info("DONE - removing", opNames.length, "ops from lookup table");
        }
    }

    removeOpNameFromLookup(opName)
    {
        if (!opName) return;
        this.removeOpNamesFromLookup([opName]);
    }

    addOpsToLookup(ops, clearFiles = false)
    {
        if (!ops) return;
        if (clearFiles) this._log.info("rewriting caches with", ops.length, "ops");
        let cachedLookup = this.getCachedOpLookup();
        if (clearFiles || !cachedLookup) cachedLookup = {};
        if (clearFiles || !cachedLookup.ids) cachedLookup.ids = {};
        if (clearFiles || !cachedLookup.names) cachedLookup.names = {};
        ops.forEach((op) =>
        {
            if (op && op.name && op.id)
            {
                cachedLookup.ids[op.id] = op.name;
                cachedLookup.names[op.name] = op.id;
            }
        });
        jsonfile.writeFileSync(this._cables.getOpLookupFile(), cachedLookup);
    }

    replaceOpNameInLookup(oldName, newName)
    {
        if (!oldName || !newName) return;
        let cachedLookup = this.getCachedOpLookup();
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
        const opFileName = this._opsUtil.getOpAbsoluteFileName(opName);
        if (this._opsUtil.opExists(opName) && fs.existsSync(opFileName))
        {
            docObj = {
                "name": opName,
                "content": ""
            };

            const dirName = this._opsUtil.getOpSourceDir(opName);

            docObj.attachmentFiles = this._opsUtil.getAttachmentFiles(opName) || [];

            const jsonFilename = path.join(dirName, opName + ".json");
            const jsonExists = fs.existsSync(jsonFilename);

            const screenshotFilename = dirName + "screenshot.png";
            const screenshotExists = fs.existsSync(screenshotFilename);

            const parts = opName.split(".");
            const shortName = parts[parts.length - 1];

            if (!shortName) this._log.warn("no shortname ?", parts);

            parts.pop();
            const namespace = parts.join(".");

            if (!jsonExists)
            {
                this._log.warn("no json", opName, jsonFilename);
            }

            let js = {};
            try
            {
                if (jsonExists) js = jsonfile.readFileSync(jsonFilename);
            }
            catch (e)
            {
                this._log.warn("failed to read opdocs from file", opName, jsonFilename, e);
            }

            if (js)
            {
                docObj.summary = js.summary || "";
                docObj.shortName = shortName;
                docObj.id = js.id;
                docObj.layout = js.layout;
                docObj.ports = js.ports;
                if (js.credits) docObj.credits = js.credits;
                docObj.hasScreenshot = screenshotExists;
                docObj.authorName = js.authorName || "unknown";
                docObj.docs = js.docs;
                docObj.license = js.license;
                docObj.hasExample = !!js.exampleProjectId;
                docObj.exampleProjectId = js.exampleProjectId || "";
                docObj.namespace = namespace;
                docObj.name = opName;
                docObj.nameNoVersion = this._opsUtil.getOpNameWithoutVersion(opName);
                docObj.shortNameDisplay = this._opsUtil.getOpNameWithoutVersion(shortName);
                docObj.version = this._opsUtil.getVersionFromOpName(opName);
                docObj.libs = js.libs || [];
                docObj.youtubeids = js.youtubeids || [];
                docObj.created = js.created;
                docObj.hasPublicRepo = this._opsUtil.isCoreOp(opName) || this._opsUtil.isExtension(opName);
                docObj.hidden = (this._opsUtil.isDeprecated(opName) || this._opsUtil.isAdminOp(opName));

                if (js.changelog)
                {
                    docObj.changelog = js.changelog;
                }
                if (js.todos)
                {
                    docObj.todos = js.todos;
                }
                if (js.coreLibs)
                {
                    docObj.coreLibs = js.coreLibs;
                }
                if (js.issues)
                {
                    docObj.issues = js.issues;
                }
                if (js.caniusequery)
                {
                    docObj.caniusequery = js.caniusequery;
                }
                if (js.dependencies)
                {
                    docObj.dependencies = js.dependencies;
                }
            }

            const mdFile = path.join(this._opsUtil.getOpSourceDir(opName), opName + ".md");
            const exists = fs.existsSync(mdFile);
            if (exists)
            {
                let doc = fs.readFileSync(mdFile);
                doc = this.setOpLinks(marked(doc + "" || ""));
                doc = (doc + "").replace(/src="/g, "src=\"https://cables.gl/ops/" + opName + "/");
                docObj.content = doc;
            }
        }
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

    getCollectionOpDocs(collectionName, currentUser)
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
            const dirName = this._opsUtil.getCollectionOpDocFile(collectionName);
            if (fs.existsSync(dirName))
            {
                const opNames = this._opsUtil.getCollectionOpNames(collectionName);
                opDocs = this._opsUtil.addOpDocsForCollections(opNames, opDocs);
            }
        }
        opDocs = this._opsUtil.addVersionInfoToOps(opDocs);
        opDocs = this._opsUtil.addPermissionsToOps(opDocs, currentUser);
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
            if (fs.existsSync(opsFile))
            {
                const otherDocs = jsonfile.readFileSync(opsFile);
                if (otherDocs && otherDocs.exampleProjectId) return otherDocs.exampleProjectId;
            }
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
            return this._opsUtil.buildOpDocsForCollection(collectionName, opName);
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
        });
        return cleanDocs;
    }

    getAllExtensionDocs(filterOldVersions = false, filterDeprecated = false)
    {
        const collectionPath = this._cables.getExtensionOpsPath();
        const extensions = [];
        if (collectionPath && fs.existsSync(collectionPath))
        {
            const exDirs = fs.readdirSync(collectionPath);
            exDirs.forEach((extensionName) =>
            {
                if (this._opsUtil.isExtension(extensionName) && this._opsUtil.getCollectionVisibility(extensionName) === this._opsUtil.VISIBILITY_PUBLIC)
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

    rebuildOpCaches(cb, scopes = ["core"], clearFiles = false)
    {
        this._rebuildOpDocCache = true;

        const coreDocs = this.getOpDocs();
        let docs = [];
        if (scopes.includes("core"))
        {
            docs = coreDocs;
            this._log.info("updating", coreDocs.length, "ops in core");
        }

        let opNames = [];
        if (scopes.includes("extensions"))
        {
            const extensionOpNames = this._opsUtil.getAllExtensionOpNames();
            this._log.info("updating", extensionOpNames.length, "ops in extensions");
            opNames = opNames.concat(extensionOpNames);
        }

        if (scopes.includes("teams"))
        {
            const teamOpNames = this._opsUtil.getAllTeamOpNames();
            this._log.info("updating", teamOpNames.length, "ops in teams");
            opNames = opNames.concat(teamOpNames);
        }

        if (scopes.includes("users"))
        {
            const userOpNames = this._opsUtil.getAllUserOpNames();
            this._log.info("updating", userOpNames.length, "ops in users");
            opNames = opNames.concat(userOpNames);
        }

        if (scopes.includes("patches"))
        {
            const patchOpNames = this._opsUtil.getAllPatchOpNames();
            this._log.info("updating", patchOpNames.length, "ops in patches");
            opNames = opNames.concat(patchOpNames);
        }

        let collections = [];
        opNames.forEach((opName) =>
        {
            collections.push(this._opsUtil.getCollectionName(opName));
        });

        collections = this._helperUtil.uniqueArray(collections);
        collections.forEach((collection) =>
        {
            this._opsUtil.buildOpDocsForCollection(collection);
        });
        docs = docs.concat(this.getOpDocsForCollections(opNames));

        // make sure all ops are in lookup table
        this.addOpsToLookup(docs, clearFiles);
        if (cb) cb(docs);
    }

    getOpDocsForCollections(opNames, currentUser)
    {
        let opDocs = [];
        let collections = [];
        opNames.forEach((extOp) =>
        {
            collections.push(this._opsUtil.getCollectionName(extOp));
        });
        collections = this._helperUtil.uniqueArray(collections);
        collections.forEach((collection) =>
        {
            opDocs = opDocs.concat(this.getCollectionOpDocs(collection, currentUser));
        });
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
                const filename = this._opsUtil.getOpAbsolutePath(opName) + opName + ".json";
                try
                {
                    if (fs.existsSync(filename))
                    {
                        const obj = jsonfile.readFileSync(filename);
                        if (obj.libs)libs = libs.concat(obj.libs);
                    }
                }
                catch (ex) { this._log.error("no ops meta info found", opName, filename); }
            }
        }
        libs = this._helperUtil.uniqueArray(libs);
        return libs;
    }
}

