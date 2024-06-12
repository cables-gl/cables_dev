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
        return path.join("/assets/", projectId, "/");
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
        proj.ops.forEach((op) =>
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
        _libs = _libs.concat(fs.readdirSync(this._cables.getLibsPath()));
        const libs = [];
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
        return libs;
    }

    getCoreLibs()
    {
        const _coreLibs = fs.readdirSync(this._cables.getCoreLibsPath());
        const coreLibs = [];
        for (let i = 0; i < _coreLibs.length; i++)
        {
            const coreFilename = _coreLibs[i];
            if (coreFilename.endsWith(".js"))
            {
                coreLibs.push(coreFilename.split(".")[0]);
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
}
