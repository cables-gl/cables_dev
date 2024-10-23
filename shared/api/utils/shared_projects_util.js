import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import sanitizeFileName from "sanitize-filename";
import generate from "project-name-generator";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

export default class SharedProjectsUtil extends SharedUtil
{
    get utilName()
    {
        return UtilProvider.PROJECTS_UTIL;
    }

    getAssetPath(projectId)
    {
        return path.join(this._cables.getAssetPath(), String(projectId));
    }

    getAssetPathUrl(projectId)
    {
        return "/assets/" + projectId + "/";
    }

    getScreenShotPath(pId)
    {
        pId = sanitizeFileName("" + pId);
        return this.getAssetPath(pId) + "/_screenshots/";
    }

    getProjectExampleOps(proj)
    {
        if (!proj || !proj.ops) return [];
        let opDocs = this._docsUtil.getOpDocs();
        let nonCoreOpNames = [];
        if (proj.ops) proj.ops.forEach((op) =>
        {
            const opName = this._opsUtil.getOpNameById(op.opId);
            if (opName && !this._opsUtil.isCoreOp(opName)) nonCoreOpNames.push(opName);
        });
        if (nonCoreOpNames.length > 0)
        {
            nonCoreOpNames = this._helperUtil.uniqueArray(nonCoreOpNames);
            opDocs = opDocs.concat(this._docsUtil.getOpDocsForCollections(nonCoreOpNames));
        }
        const exampleForOps = [];
        const projectIds = [proj._id];
        if (proj.shortId) projectIds.push(proj.shortId);
        for (let i = 0; i < opDocs.length; i++)
        {
            const opDoc = opDocs[i];
            if (opDoc.hasOwnProperty("exampleProjectId") && projectIds.includes(opDoc.exampleProjectId))
            {
                if (opDoc.name && opDoc.name !== "") exampleForOps.push(opDoc.name);
            }
        }
        return exampleForOps;
    }

    saveProjectScreenshot(proj, bodyScreenshot)
    {
        const data = bodyScreenshot.substr("data:image/png;base64,".length);
        let ext = "";

        if (bodyScreenshot.startsWith("data:image/png")) ext = "png";

        if (ext === "png")
        {
            const bitmap = Buffer.from(data, "base64");

            const exampleOps = this.getProjectExampleOps(proj);
            if (exampleOps.length > 0)
            {
                exampleOps.forEach((op) =>
                {
                    const p = this._opsUtil.getOpAbsolutePath(op);
                    if (p && fs.existsSync(p))
                    {
                        const fn = p + "screenshot." + ext;
                        this._log.verbose("save op screenshot to", fn);
                        fs.writeFileSync(fn, bitmap);
                    }
                    else this._log.error("invalid op screenshot path: ", op, p);
                });
            }

            const screenShotPath = this.getScreenShotPath(proj._id);
            if (!fs.existsSync(screenShotPath)) mkdirp.sync(screenShotPath);

            if (proj.settings && proj.settings.manualScreenshot) this._log.event(null, "project", "screenshot", "manually_saved");
            const filenameScreenshot = this.getScreenShotFileName(proj, ext);
            fs.writeFileSync(filenameScreenshot, bitmap);
            return filenameScreenshot;
        }
        else
        {
            this._log.warn("patch screenshot UNKNOWN format, should be png", "EXT: " + ext, proj.shortId);
        }
        return null;
    }

    _makeProjectReadable(project, keepOps = false, allowEdit = false)
    {
        if (!project) return null;
        let readable = {
            "_id": project._id,
            "id": project._id,
            "shortId": project.shortId,
            "name": project.name,
            "description": project.description,
            "link": project.link,
            "allowEdit": allowEdit,
            "cachedUsername": project.cachedUsername,
            "summary": project.summary,
            "tags": project.tags,
            "thumbnail": project.thumbnail,
            "created": project.created,
            "updated": project.updated,
            "published": project.published,
            "updatedByUser": project.updatedByUser,
            "userId": project.userId,
            "users": project.users,
            "usersReadOnly": project.usersReadOnly,
            "visibility": project.visibility,
            "views": project.views,
            "cachedNumComments": project.cachedNumComments,
            "cachedNumFavs": project.cachedNumFavs
        };

        if (project.settings)
        {
            readable.settings = {};
            if (project.settings.hasOwnProperty("manualScreenshot")) readable.manualScreenshot = project.settings.manualScreenshot;
            if (project.settings.hasOwnProperty("licence")) readable.licence = project.settings.licence;
        }

        if (project.buildInfo)
        {
            readable.buildInfo = {
                "host": project.buildInfo.host,
                "core": project.buildInfo.core,
                "ui": project.buildInfo.ui,
                "api": project.buildInfo.api
            };
        }

        if (keepOps) readable.ops = project.ops;
        return readable;
    }

    /**
     *
     * reduces the object to information that can be sent "over the wire", removes
     * private information, will add isExample and opExampleFor
     * information for projects that are marked as an example for ops
     **
     * @param ps project or array of projects
     * @param keepOps do not remove ops from the project (i.e. in export)
     * @param allowEdit
     * @returns {({}|*[]|*)} project or array of projects
     */
    makeReadable(ps, keepOps = false, allowEdit = false)
    {
        if (!ps) return {};
        if (!(ps instanceof Array)) return this._makeProjectReadable(ps, keepOps, allowEdit);

        const readables = [];
        ps.forEach((p) =>
        {
            const readable = this._makeProjectReadable(p, keepOps, allowEdit);
            readables.push(readable);
        });
        return readables;
    }

    makeExportable(p, keepAlso = [])
    {
        let readable = JSON.parse(JSON.stringify(p));
        readable = this.makeReadable(readable, true);

        const keepInExport = ["_id", "ops", ...keepAlso];
        const keepUiAttribs = ["subPatch"];

        for (let key in readable)
        {
            if (!keepInExport.includes(key)) delete readable[key];
        }

        for (let j = 0; j < readable.ops.length; j++)
        {
            const op = readable.ops[j];
            if (op.opId)
            {
                const objName = this._opsUtil.getOpNameById(op.opId);
                if (objName)
                {
                    readable.ops[j].objName = objName;
                    delete readable.ops[j].opId;
                }
                else
                {
                    this._log.error("NO OBJNAME BY ID IN EXPORT", p.shortId, op.opId);
                }
            }
            else
            {
                if (op.objName)
                {
                    this._log.warn("NO OPID IN EXPORT", p.should, op.objName);
                }
                else
                {
                    this._log.error("NO OPID AND NO OBJNAME IN PROJECT", p.shortId, op);
                }
            }

            if (op.uiAttribs)
            {
                for (let key in op.uiAttribs)
                {
                    if (!keepUiAttribs.includes(key)) delete readable.ops[j].uiAttribs[key];
                }
            }
        }

        return readable;
    }

    getBackup(project)
    {
        // remove deployment information and secrets
        if (project.deployments)
        {
            for (let key in project.deployments)
            {
                if (key !== "lastDeployment") delete project.deployments[key];
            }
        }
        if (project.settings && project.settings.secret)
        {
            delete project.settings.secret;
        }
        return project;
    }

    getNewProjectName(randomize = false)
    {
        if (!randomize) return "new project";
        const randomName = generate().spaced;
        return randomName.substring(0, this._helperUtil.MAX_NAME_LENGTH);
    }

    getScreenShotFileName(proj, ext)
    {
        const screenShotPath = this.getScreenShotPath(proj.id);
        return path.join(screenShotPath, "/", "screenshot_" + Date.now() + ".tmp." + ext);
    }

    getProjectAssetPorts(proj, includeLibraryAssets = false)
    {
        let assetPorts = [];
        if (!proj || !proj.ops) return assetPorts;
        for (let o = 0; o < proj.ops.length; o++)
        {
            if (proj.ops[o].portsIn)
            {
                assetPorts = assetPorts.concat(this._opsUtil.getOpAssetPorts(proj.ops[o], includeLibraryAssets));
            }
        }
        return assetPorts;
    }

    getAvailableLibs(project)
    {
        let _libs = [];
        if (project)
        {
            _libs = this.getAssetLibs(project);
        }
        const libsPath = this._cables.getLibsPath();
        const libs = [];
        if (fs.existsSync(libsPath))
        {
            _libs = _libs.concat(fs.readdirSync(this._cables.getLibsPath()));
            for (let i = 0; i < _libs.length; i++)
            {
                let skip = false;
                if (_libs[i].endsWith(".js"))
                {
                    const libName = path.parse(_libs[i]);
                    if (libName)
                    {
                        let jsonName = path.join(this._cables.getLibsPath(), libName.name);
                        jsonName += ".json";
                        if (fs.existsSync(jsonName))
                        {
                            const json = JSON.parse(fs.readFileSync(jsonName));
                            if (json.hidden)
                            {
                                skip = true;
                            }
                        }
                    }
                    if (!skip)
                    {
                        libs.push(_libs[i]);
                    }
                }
            }
        }
        return libs;
    }

    getCoreLibs()
    {
        const coreLibsPath = this._cables.getCoreLibsPath();
        const coreLibs = [];
        if (fs.existsSync(coreLibsPath))
        {
            const _coreLibs = fs.readdirSync(coreLibsPath);
            for (let i = 0; i < _coreLibs.length; i++)
            {
                const coreFilename = _coreLibs[i];
                if (coreFilename.endsWith(".js"))
                {
                    coreLibs.push(coreFilename.split(".")[0]);
                }
            }
        }
        return coreLibs;
    }

    getAssetLibs(project)
    {
        if (!project) return [];
        const libs = [];
        const assetPath = this.getAssetPath(project._id);
        if (fs.existsSync(assetPath))
        {
            let _libs = fs.readdirSync(assetPath);
            for (let i = 0; i < _libs.length; i++)
            {
                let skip = false;
                if (_libs[i].endsWith(".js"))
                {
                    const libName = path.parse(_libs[i]);
                    if (libName)
                    {
                        let jsonName = path.join(this._cables.getLibsPath(), libName.name);
                        jsonName += ".json";
                        if (fs.existsSync(jsonName))
                        {
                            const json = JSON.parse(fs.readFileSync(jsonName));
                            if (json.hidden)
                            {
                                skip = true;
                            }
                        }
                    }
                    if (!skip)
                    {
                        libs.push(path.join("/assets", String(project._id), _libs[i]));
                    }
                }
            }
        }

        return libs;
    }

    getCreditsTextArray(proj)
    {
        let credits = [];
        let first = true;
        if (proj && proj.ops)
            for (let i = 0; i < proj.ops.length; i++)
            {
                const info = this._opsUtil.getOpInfo(this._opsUtil.getOpNameById(proj.ops[i].opId));
                if (info && info.authorName)
                {
                    if (first)
                    {
                        credits.push("OP AUTHORS:");
                        credits.push("");
                        first = false;
                    }
                    credits.push("- ops by cables user " + info.authorName + " (https://cables.gl/user/" + info.authorName + ")");
                }

                if (info && info.credits)
                {
                    for (let j = 0; j < info.credits.length; j++)
                    {
                        let str = "- " + info.credits[j].title;
                        if (info.credits[j].author) str += " by " + info.credits[j].author;
                        if (info.credits[j].url) str += " (" + info.credits[j].url + ")";
                        credits.push(str);
                    }
                }
            }

        credits = this._helperUtil.uniqueArray(credits);

        credits.push("");
        credits.push("cables is build on open source software and community contributions, check https://cables.gl/support");

        return credits;
    }

    getLicenceTextArray(proj)
    {
        let usedOpsNames = {};
        proj.ops.forEach((op) =>
        {
            usedOpsNames[op.opId] = this._opsUtil.getOpNameById(op.opId);
        });
        usedOpsNames = Object.values(usedOpsNames);
        const libs = this._docsUtil.getProjectLibs(proj);

        const legal = {};

        for (let i = 0; i < usedOpsNames.length; i++)
        {
            const info = this._opsUtil.getOpInfo(usedOpsNames[i]);
            if (info && info.credits)
            {
                for (let j = 0; j < info.credits.length; j++)
                {
                    const credit = info.credits[j];
                    if (credit.licence)
                    {
                        if (!legal.hasOwnProperty(credit.licence))
                        {
                            legal[credit.licence] = [];
                        }
                        if (!legal[credit.licence].find((l) => { return l.url == credit.url; }))
                        {
                            legal[credit.licence].push(credit);
                        }
                    }
                }
            }
        }

        for (let i = 0; i < libs.length; i++)
        {
            const lib = libs[i];
            const baseName = path.parse(lib).name;
            try
            {
                if (this._libsUtil.isAssetLib(lib))
                {
                    const licence = "uploaded/unknown";
                    const filename = path.basename(lib);
                    if (!legal.hasOwnProperty(licence))
                    {
                        legal[licence] = [];
                    }
                    if (!legal[licence].find((l) => { return l.url === lib; }))
                    {
                        legal[licence].push({
                            "title": filename,
                            "url": lib
                        });
                    }
                }
                else
                {
                    const filename = path.join(this._cables.getLibsPath(), baseName + ".json");
                    const libInfo = JSON.parse(fs.readFileSync(filename, "utf8"));
                    if (libInfo && libInfo.hasOwnProperty("licence"))
                    {
                        if (!legal.hasOwnProperty(libInfo.licence))
                        {
                            legal[libInfo.licence] = [];
                        }
                        if (!legal[libInfo.licence].find((l) => { return l.url === libInfo.url; }))
                        {
                            legal[libInfo.licence].push({
                                "title": libInfo.title,
                                "url": libInfo.url
                            });
                        }
                    }
                }
            }
            catch (e)
            {
                this._log.error("FAILED TO LOAD INFOFILE FOR LIBRARY:", lib);
            }
        }

        const legalText = [];
        legalText.push("All cables core code is licenced under the MIT licence");
        legalText.push("");
        legalText.push("Some ops may be using code from contributors or external libraries under different licences.");
        legalText.push("");

        if (Object.keys(legal).length > 0)
        {
            legalText.push("Additional code from contributors and libraries in this export are licenced as follows:");
            legalText.push("");
            for (const licence in legal)
            {
                legalText.push(licence + ":\n");
                for (let i = 0; i < legal[licence].length; i++)
                {
                    const contrib = legal[licence][i];
                    let str = "- " + contrib.title;
                    if (contrib.author) str += " by " + contrib.author;
                    if (contrib.url) str += " (" + contrib.url + ")";
                    legalText.push(str);
                    if (contrib.licenceText)
                    {
                        legalText.push("");
                        legalText.push(contrib.licenceText);
                    }
                }
                legalText.push("");
            }
        }

        return legalText;
    }
}
