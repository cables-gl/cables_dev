class CablesWebpackHelper
{

    constructor()
    {
        this._log = console;
        this._opLookUp = {
            "names": [],
            "ids": [],
        };
        this._opDependencies = [];
        this._coreLibs = [];
    }

    getOpDependencies()
    {
        return this._opDependencies;
    }

    addOpDependency(src, type = "commonjs", moduleExport = null)
    {
        const existingDependency = this._opDependencies.find((dep) => { return dep.src === src && dep.type === type && dep.export === moduleExport;});
        if(!existingDependency) {
            this._opDependencies.push({
                "src": src,
                "type": type,
                "export": moduleExport,
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

    getOpNameById(opId)
    {
        return this._opLookUp.ids[opId];
    }

    makeReadable(project, keepOps = false, allowEdit = false)
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
            "cachedNumFavs": project.cachedNumFavs,
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
                "api": project.buildInfo.api,
            };
        }

        if (keepOps) readable.ops = project.ops;
        return readable;
    }

    makeExportable(p, keepAlso = [], assetPath = null)
    {
        let readable = JSON.parse(JSON.stringify(p));
        readable = this.makeReadable(readable, true, false);

        const keepInExport = ["_id", "ops", ...keepAlso];
        const keepUiAttribs = ["subPatch"];

        for (let key in readable)
        {
            if (!keepInExport.includes(key)) delete readable[key];
        }

        for (let i = 0; i < readable.ops.length; i++)
        {
            const op = readable.ops[i];
            if (op.opId)
            {
                const objName = this.getOpNameById(op.opId);
                if (objName)
                {
                    readable.ops[i].objName = objName;
                    delete readable.ops[i].opId;
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
                    if (!keepUiAttribs.includes(key)) delete readable.ops[i].uiAttribs[key];
                }
                if (Object.keys(readable.ops[i].uiAttribs).length === 0) delete readable.ops[i].uiAttribs;
            }

            if (op.portsIn)
            {
                for (let j = 0; j < op.portsIn.length; j++)
                {
                    const port = op.portsIn[j];
                    if (port.anim && port.anim.keys)
                    {
                        for (let k = 0; k < port.anim.keys.length; k++)
                        {
                            if (port.anim.keys[k].hasOwnProperty("uiAttribs")) delete readable.ops[i].portsIn[j].anim.keys[k].uiAttribs;
                        }
                    }
                }
            }
        }

        return readable;
    }

    uniqueArray(arr)
    {
        const u = {};
        const a = [];
        for (let i = 0, l = arr.length; i < l; ++i)
        {
            if (!u.hasOwnProperty(arr[i]))
            {
                a.push(arr[i]);
                u[arr[i]] = 1;
            }
        }
        return a;
    }

}

export default new CablesWebpackHelper();
