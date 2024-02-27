import jsonfile from "jsonfile";
import fs from "fs-extra";
import eslint from "eslint";
import path from "path";
import marked from "marked";
import uuidv4 from "uuid-v4";
import mkdirp from "mkdirp";
import sanitizeFileName from "sanitize-filename";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

const CLIEngine = eslint.CLIEngine;

/**
 * @abstract
 */
export default class SharedOpsUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
        jsonfile.spaces = 4;

        this.PREFIX_OPS = "Ops.";
        this.PREFIX_USEROPS = "Ops.User.";
        this.PREFIX_TEAMOPS = "Ops.Team.";
        this.PREFIX_EXTENSIONOPS = "Ops.Extension.";
        this.PREFIX_ADMINOPS = "Ops.Admin.";
        this.PREFIX_PATCHOPS = "Ops.Patch.P";

        this.INFIX_DEPRECATED = ".Deprecated.";
        this.INFIX_DEVOPS = ".Dev.";
        this.SUFFIX_VERSION = "_v";

        this.PATCHOPS_ID_REPLACEMENTS = {
            "-": "___"
        };

        this.BLUEPRINT_OP_NAME = "Ops.Dev.Blueprint";
        this.SUBPATCH_OP_CURRENT_VERSION = 1;
        this.FXHASH_OP_NAME = "Ops.Extension.FxHash.FxHash";

        this.SUBPATCH_ATTACHMENT_NAME = "att_subpatch_json";

        this.OP_NAME_MIN_LENGTH = 5;

        this.OP_NAMESPACE_SUMMARIES =
            [
                {
                    "ns": "Ops.Gl",
                    "summary": "WebGl Ops"
                },
                {
                    "ns": "Ops.Exp",
                    "summary": "Experimental Ops"
                },
                {
                    "ns": "Ops.Anim",
                    "summary": "Animations"
                },
                {
                    "ns": "Ops.Array",
                    "summary": "process and manipulate collections (arrays) of data"
                }
            ];

        this.INVISIBLE_NAMESPACES = [
            this.PREFIX_ADMINOPS,
            this.PREFIX_USEROPS
        ];

        this.cli = new CLIEngine(this._getCLIConfig());
    }

    get utilName()
    {
        return UtilProvider.OPS_UTIL;
    }

    isOpNameValid(name)
    {
        if (!name) return false;
        if (name.length < this.OP_NAME_MIN_LENGTH) return false;
        if (name.indexOf("..") !== -1) return false;
        let matchString = "[^abcdefghijklmnopqrstuvwxyz._ABCDEFGHIJKLMNOPQRSTUVWXYZ0-9";
        // patchops can have - because they contain the patch shortid
        if (this.isPatchOp(name) || this.isTeamOp(name)) matchString += "\\-";
        matchString += "]";
        if (name.match(matchString)) return false;

        const parts = name.split(".");
        for (let i = 0; i < parts.length; i++) // do not start
        {
            const firstChar = parts[i].charAt(0);
            const isnum = !isNaN(firstChar);
            if (isnum) return false;
            if (firstChar === "-") return false;
        }

        if (name.endsWith(".json")) return false;

        return name.startsWith(this.PREFIX_OPS);
    }

    getOpAbsoluteJsonFilename(opname)
    {
        const p = this.getOpAbsolutePath(opname);
        if (!p) return null;
        return p + opname + ".json";
    }

    getOpAbsolutePath(opname)
    {
        if (!opname) return null;
        if (!this.isOpNameValid(opname)) return null;

        return this.getOpSourceDir(opname);
    }

    getOpById(opDocs, id)
    {
        for (let i = 0; i < opDocs.length; i++)
        {
            if (opDocs[i].id === id) return opDocs[i];
        }
    }

    getOpNameById(id)
    {
        const idLookup = this._docsUtil.getCachedOpLookup();
        if (idLookup && idLookup.ids)
        {
            return idLookup.ids[id] || "";
        }
        return "";
    }

    getOpIdByObjName(objName)
    {
        const nameLookup = this._docsUtil.getCachedOpLookup();
        if (nameLookup && nameLookup.names)
        {
            let lookupId = nameLookup.names[objName];
            if (!lookupId)
            {
                const opDoc = this._docsUtil.buildOpDocs(objName);
                if (opDoc && opDoc.id)
                {
                    this._docsUtil.addOpToLookup(opDoc.id, objName);
                    lookupId = opDoc.id;
                }
            }
            return lookupId;
        }
        return null;
    }

    getOpVersionNumbers(opname, opDocs)
    {
        let versions = [];
        if (!opname) return versions;

        const nameWithoutVersion = this.getOpNameWithoutVersion(opname);
        versions = versions || [];

        for (let i = 0; i < opDocs.length; i++)
        {
            if (opDocs[i].nameNoVersion === nameWithoutVersion)
            {
                const v = this.getVersionFromOpName(opDocs[i].name);
                let vStr = this.SUFFIX_VERSION + v;
                if (v === 0) vStr = "";
                versions.push(
                    {
                        "name": opDocs[i].name,
                        "versionString": vStr,
                        "version": v
                    }
                );
            }
        }
        return versions.sort((a, b) => { return a.version - b.version; });
    }

    getHighestVersionOpName(opName, opDocs = false)
    {
        if (!opDocs) opDocs = this._docsUtil.getOpDocs();
        const opnameWithoutVersion = this.getOpNameWithoutVersion(opName);
        const highestVersion = this.getHighestVersionNumber(opName, opDocs);
        if (highestVersion === 0)
        {
            return opnameWithoutVersion;
        }
        else
        {
            return opnameWithoutVersion + this.SUFFIX_VERSION + highestVersion;
        }
    }

    getHighestVersionNumber(opName, opDocs)
    {
        const opnameWithoutVersion = this.getOpNameWithoutVersion(opName);

        let highestVersion = 0;
        opDocs.forEach((opDoc) =>
        {
            if (opDoc.nameNoVersion === opnameWithoutVersion)
            {
                if (opDoc.version > highestVersion)
                {
                    highestVersion = opDoc.version;
                }
            }
        });
        return highestVersion;
    }

    getOpNameWithoutVersion(opname)
    {
        const ver = this.getVersionFromOpName(opname);

        let str = "";
        if (ver) str = this.SUFFIX_VERSION + ver;

        return opname.substring(0, opname.length - str.length);
    }

    getVersionFromOpName(opname)
    {
        if (!opname) return 0;
        if (opname.indexOf(this.SUFFIX_VERSION) === -1) return 0;

        const parts = opname.split(".");
        const lastPart = parts[parts.length - 1];
        const lastParts = lastPart.split(this.SUFFIX_VERSION);

        if (lastParts.length === 2)
        {
            if (this._helperUtil.isNumeric(lastParts[1]))
            {
                return parseFloat(lastParts[1]);
            }
            else return 0;
        }
        else return 0;
    }

    getOpInfo(opname)
    {
        let info = {};

        const jsonFilename = this.getOpAbsolutePath(opname) + opname + ".json";
        const screenshotFilename = this.getOpAbsolutePath(opname) + "screenshot.png";
        const jsonExists = fs.existsSync(jsonFilename);
        let screenshotExists = false;
        try
        {
            screenshotExists = fs.existsSync(screenshotFilename);
        }
        catch (e)
        {}

        if (jsonExists)
        {
            info = jsonfile.readFileSync(jsonFilename);
            info.hasScreenshot = screenshotExists;
            info.shortName = opname.split(".")[opname.split(".").length - 1];
            info.hasExample = !!info.exampleProjectId;
        }
        info.doc = this._docsUtil.getOpDocMd(opname);
        return info;
    }

    addOpChangeLogMessages(user, opName, messages, type = "")
    {
        if (!messages || messages.length === 0) return;
        const changes = [];
        messages.forEach((message) =>
        {
            const change = {
                "message": message,
                "type": type,
                "author": user.username,
                "date": Date.now()
            };
            changes.push(change);
            this._log.info("add changelog", opName, change.author, change.message);
        });

        const filename = this.getOpAbsoluteJsonFilename(opName);
        const obj = jsonfile.readFileSync(filename);
        if (obj)
        {
            obj.changelog = obj.changelog || [];
            obj.changelog = obj.changelog.concat(changes);
            jsonfile.writeFileSync(filename, obj, { "encoding": "utf-8", "spaces": 4 });
            const logStr = "*" + user.username + "* added changelog " + opName + " - https://cables.gl/op/" + opName;
            this._log.info(logStr);
        }
    }

    addOpChangelog(user, opname, message, type = "")
    {
        this.addOpChangeLogMessages(user, opname, [message], type);
    }

    getOpFullCode(fn, name, opid = null)
    {
        if (!fn || !name) return "";

        try
        {
            const code = fs.readFileSync(fn, "utf8");
            if (!opid) opid = this.getOpIdByObjName(name);
            let codeAttachments = "const attachments=op.attachments={";
            let codeAttachmentsInc = "";
            const dir = fs.readdirSync(path.dirname(fn));
            for (const i in dir)
            {
                if (dir[i].startsWith("att_inc_"))
                {
                    codeAttachmentsInc += fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8");
                }
                if (dir[i].startsWith("att_bin_"))
                {
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":\"" + Buffer.from(fs.readFileSync(path.dirname(fn) + "/" + dir[i]))
                        .toString("base64") + "\",";
                }
                else if (dir[i].startsWith("att_"))
                {
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8")) + ",";
                }
            }

            codeAttachments += "};\n";

            const codeHead = "\n\n// **************************************************************\n" +
                "// \n" +
                "// " + name + "\n" +
                "// \n" +
                "// **************************************************************\n\n" +
                name + " = function()\n{\nCABLES.Op.apply(this,arguments);\nconst op=this;\n";
            let codeFoot = "\n\n};\n\n" + name + ".prototype = new CABLES.Op();\n";

            if (opid) codeFoot += "CABLES.OPS[\"" + opid + "\"]={f:" + name + ",objName:\"" + name + "\"};";
            codeFoot += "\n\n\n";

            return codeHead + codeAttachments + codeAttachmentsInc + code + codeFoot;
        }
        catch (e)
        {
            this._log.warn("getfullopcode fail", fn, name);
        }
        return "";
    }

    getOpCodeWarnings(opname, jsFile = null)
    {
        const info = this.getOpInfo(opname);

        const blendmodeWarning = ": use `{{CGL.BLENDMODES}}` in your shader and remove all manual replace code";
        const srcWarnings = [];
        const fn = this.getOpAbsoluteFileName(opname);
        if (this.existingCoreOp(opname))
        {
            const parts = opname.split(".");
            for (let i = 0; i < parts.length; i++)
                if (parts[i].charAt(0) !== parts[i].charAt(0)
                    .toUpperCase())
                    srcWarnings.push({
                        "type": "name",
                        "id": "lowercase",
                        "text": marked("all namespace parts have to be capitalized")
                    });
        }

        if (jsFile || fs.existsSync(fn))
        {
            let code = jsFile || fs.readFileSync(fn, "utf8");

            if (!info.id) srcWarnings.push({
                "type": "json",
                "id": "noId",
                "text": marked("has no op id")
            });
            if (!info) srcWarnings.push({
                "type": "json",
                "id": "noJson",
                "text": marked("has no json")
            });
            else
            {
                if (!info.layout) srcWarnings.push({
                    "type": "json",
                    "id": "noLayout",
                    "text": marked("has no layout")
                });
                if (!info.authorName || info.authorName === "") srcWarnings.push({
                    "type": "json",
                    "id": "noAuthor",
                    "text": marked("has no author")
                });
            }

            if (code.indexOf("void main()") > -1) srcWarnings.push({
                "type": "code",
                "id": "inlineShaderCode",
                "text": marked("found shader code in the .js, should be put to an attachment")
            });

            if (code.indexOf("self.") > -1) srcWarnings.push({
                "type": "code",
                "id": "self",
                "text": ""
            });

            if (code.indexOf("cgl.mvMatrix") > -1) srcWarnings.push({
                "type": "code",
                "id": "mvMatrix",
                "text": marked("use of `MvMatrix` is deprecated, use cgl.mMatrix / cgl.vMatrix instead.")
            });

            if (code.indexOf("OP_PORT_TYPE_TEXTURE") > -1) srcWarnings.push({
                "type": "code",
                "id": "texturePortType",
                "text": marked("use `op.inTexture(\"name\")` to create a texture port ")
            });

            if (opname.indexOf("Ops.Gl.ImageCompose") >= 0 && code.indexOf("checkOpInEffect") == -1 && opname.indexOf("ImageCompose") == -1) srcWarnings.push({
                "type": "code",
                "id": "no_check_effect",
                "text": marked("every textureEffect op should use `if(!CGL.TextureEffect.checkOpInEffect(op)) return;` in the rendering function to automatically show a warning to the user if he is trying to use it outside of an imageCompose")
            });

            if (code.indexOf(".onValueChange") > -1) srcWarnings.push({
                "type": "code",
                "id": "onValueChanged",
                "text": marked("do not use `port.onValueChanged=`, now use `port.onChange=`")
            });

            if (code.indexOf(".inValueEditor") > -1) srcWarnings.push({
                "type": "code",
                "id": "inValueEditor",
                "text": marked("do not use `op.inValueEditor()`, now use `op.inStringEditor()`")
            });

            if (code.indexOf(".inFile") > -1) srcWarnings.push({
                "type": "code",
                "id": "inFile",
                "text": marked("do not use `op.inFile()`, now use `op.inUrl()`")
            });

            if (code.indexOf("op.outValue") > -1) srcWarnings.push({
                "type": "code",
                "id": "op.outValue",
                "text": marked("use `op.outNumber`, or `op.outString` ")
            });

            if (code.indexOf("\"use strict\";") > -1) srcWarnings.push({
                "type": "code",
                "id": "use strict",
                "text": marked("\"use strict\"; is not needed, remove it!")
            });

            if (code.indexOf("\nvar ") > -1) srcWarnings.push({
                "type": "code",
                "id": "var",
                "text": marked("use `let`, or `const` ")
            });

            if (code.indexOf(".val=") > -1 || code.indexOf(".val =") > -1 || code.indexOf(".val;") > -1) srcWarnings.push({
                "type": "code",
                "id": ".val",
                "text": marked("do not use `port.val`, now use `port.get()`")
            });

            if (code.indexOf("op.addInPort(") > -1) srcWarnings.push({
                "type": "code",
                "id": "port",
                "text": marked("use `op.inValue` or `op.inTrigger` etc. to create ports...")
            });

            if (code.indexOf("colorPick: 'true'") > -1 || code.indexOf("colorPick:'true'") > -1) srcWarnings.push({
                "type": "code",
                "id": "colorpick",
                "text": marked("how to create a colorpicker the nice way: \n const r = op.inValueSlider(\"r\", Math.random());\n\nconst g = op.inValueSlider(\"g\", Math.random());\nconst b = op.inValueSlider(\"b\", Math.random()); \nr.setUiAttribs({ colorPick: true }); ")
            });

            if (code.indexOf("blendMode.onChange") > -1) srcWarnings.push({
                "type": "code",
                "id": "blendmode",
                "text": marked("do not directly set `.onChange` for blendMode select. use this now: `CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);`")
            });

            if (code.indexOf("op.outFunction") > -1) srcWarnings.push({
                "type": "code",
                "id": "outFunction",
                "text": marked("use `op.outTrigger` instead of `op.outFunction` ")
            });
            if (code.indexOf("op.inFunction") > -1) srcWarnings.push({
                "type": "code",
                "id": "inFunction",
                "text": marked("use `op.inTrigger` instead of `op.inFunction` ")
            });

            if (code.indexOf("{{BLENDCODE}}") > -1) srcWarnings.push({
                "type": "shadercode",
                "id": "blendmode",
                "text": marked(blendmodeWarning)
            });

            // remove comments, before checking for console usage
            code = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");
            if (code.indexOf("console.log") > -1) srcWarnings.push({
                "type": "code",
                "id": "console.log",
                "text": marked("use `op.log`, not `console.log` ")
            });

            // if (code.indexOf("console.warn") > -1) srcWarnings.push({
            //     "type": "code",
            //     "id": "console.warn",
            //     "text": marked("use `op.logWarn`, not `console.warn` ")
            // });

            // if (code.indexOf("console.error") > -1) srcWarnings.push({
            //     "type": "code",
            //     "id": "console.error",
            //     "text": marked("use `op.logError`, not `console.error` ")
            // });

            const atts = this.getAttachmentFiles(opname);

            for (let i = 0; i < atts.length; i++)
            {
                if (atts[i].indexOf(".frag"))
                {
                    const opFn = this.getOpAbsolutePath(opname) + atts[i];
                    const att = fs.readFileSync(opFn, "utf8");

                    if (att.indexOf("gl_FragColor") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "gl_FragColor",
                        "text": marked(atts[i] + ": use `outColor=vec4();` instead of gl_FragColor.")
                    });
                    // if (att.indexOf("precision ") > -1) srcWarnings.push({ "type": "shadercode", "id": "precision ", "text": marked(atts[i] + ": do not set precision in shadercode") });
                    if (att.indexOf("texture2D(") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "texture2D ",
                        "text": marked(atts[i] + ": do not set `texture2D`, use `texture()`")
                    });
                    if (att.indexOf(" uniform") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "uniform ",
                        "text": marked(atts[i] + ": use `UNI` instead of `uniform`")
                    });
                    if (att.indexOf("{{BLENDCODE}}") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "blendmode",
                        "text": marked(atts[i] + blendmodeWarning)
                    });

                    if (att.indexOf("_blend(base.rgb,col.rgb)") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "blending",
                        "text": marked(atts[i] + " use `outColor=cgl_blend(oldColor,newColor,amount);`")
                    });
                }
            }
        }

        return srcWarnings;
    }

    getOpAbsoluteFileName(opname)
    {
        if (this.isOpNameValid(opname))
        {
            return this.getOpAbsolutePath(opname) + opname + ".js";
        }
        return null;
    }

    getAttachmentFiles(opName)
    {
        const attachmentFiles = [];
        const dirName = this.getOpAbsolutePath(opName);

        try
        {
            const attFiles = fs.readdirSync(dirName);
            for (const j in attFiles) if (attFiles[j].indexOf("att_") === 0) attachmentFiles.push(attFiles[j]);
        }
        catch (e)
        {
            this._log.warn("getattachmentfiles exception " + dirName, opName);
        }

        return attachmentFiles;
    }

    getAttachment(opName, attachmentName, res = null)
    {
        if (!opName || !attachmentName) return null;
        let attachment = null;
        if (res) res.startTime("getAttachmentFiles");
        const attachmentFiles = this.getAttachmentFiles(opName);
        if (res) res.endTime("getAttachmentFiles");

        const dirName = this.getOpAbsolutePath(opName);
        if (res) res.startTime("getAttachmentFileContent");
        for (let i = 0; i < attachmentFiles.length; i++)
        {
            const file = attachmentFiles[i];
            if (file === attachmentName)
            {
                const filename = path.join(dirName, file);

                if (fs.existsSync(filename))
                {
                    attachment = fs.readFileSync(filename, { "encoding": "utf8" });
                    break;
                }
            }
        }
        if (res) res.endTime("getAttachmentFileContent");
        return attachment;
    }

    userHasWriteRightsOp(user, opName, teams = [], project = null)
    {
        if (!user) return false;
        if (!opName) return false;
        if (!opName.startsWith(this.PREFIX_OPS)) return false;
        if (opName.indexOf("..") > -1) return false;
        if (opName.indexOf(" ") > -1) return false;
        if (opName.startsWith(".")) return false;
        if (opName.endsWith(".")) return false;

        const validName = this.isOpNameValid(opName);
        if (!validName) return false;

        if (this.isPatchOpOfProject(opName, project))
        {
            // patchops are allowed to be edited by project collaborators with full access, patch owners
            if (project.users && project.users.indexOf(user._id) > -1) return true;
            if (project.userId == user._id) return true;
            return false;
        }
        if (this.isUserOp(opName))
        {
            // useros are only allowed to edit by their owner
            return this.ownsUserOp(opName, user);
        }
        if (this.isExtensionOp(opName))
        {
            // extensions are editable for team members with write access, and for staff on dev
            if (user.isStaff) return this._cables.isDevEnv();

            let inTeam = false;
            for (let i = 0; i < teams.length; i++)
            {
                const team = teams[i];
                if (!this.isExtensionOpOfTeam(opName, team)) continue;
                inTeam = this._teamsUtil.userHasWriteAccess(user, team);
                if (inTeam) break;
            }
            return inTeam;
        }
        if (this.isTeamOp(opName))
        {
            // teamops are editable for team members with write access
            let inTeam = false;
            for (let i = 0; i < teams.length; i++)
            {
                const team = teams[i];
                if (!this.isTeamOpOfTeam(opName, team)) continue;
                inTeam = this._teamsUtil.userHasWriteAccess(user, team);
                if (inTeam) break;
            }
            return inTeam;
        }
        if (user.isStaff)
        {
            // only staff and admins is allowed to edit everything else on dev
            return this._cables.isDevEnv();
        }
        return false;
    }

    getAllOps(sessionUser, opDocs)
    {
        let i = 0;
        const arr = [];
        const dir = fs.readdirSync(this._cables.getCoreOpsPath());

        if (sessionUser)
        {
            const userOps = [];
            const dirUser = fs.readdirSync(this._cables.getUserOpsPath());

            for (i in dirUser)
            {
                if ((dirUser[i] + "").startsWith(this.getUserNamespace(sessionUser.username)) && this.isOpNameValid(dirUser[i]))
                {
                    dir.push(dirUser[i]);
                    userOps.push(dirUser[i]);
                }
            }
        }

        for (i in dir)
        {
            if (this.isOpNameValid(dir[i]))
            {
                const op = {
                    "id": this.getOpIdByObjName(dir[i]),
                    "name": dir[i]
                };

                if (this.isOpOldVersion(dir[i], opDocs)) op.oldVersion = true;
                if (this.isDeprecated(dir[i])) op.deprecated = true;

                const p = this.getOpAbsoluteFileName(dir[i]);
                try
                {
                    const o = jsonfile.readFileSync(p + "on");
                    if (o.libs && o.libs.length > 0) op.libs = o.libs;
                    if (o.coreLibs && o.coreLibs.length > 0) op.coreLibs = o.coreLibs;
                }
                catch (e) {}
                arr.push(op);
            }
        }
        return arr;
    }

    addPermissionsToOps(ops, user, teams = [], project = null)
    {
        if (!ops) return ops;
        ops.forEach((op) => { if (op) op.allowEdit = this.userHasWriteRightsOp(user, op.name, teams, project); });
        return ops;
    }

    addVersionInfoToOps(opDocs, forceUpdate = false)
    {
        opDocs.forEach((opDoc) =>
        {
            if (forceUpdate || !opDoc.hasOwnProperty("oldVersion")) opDoc.oldVersion = this.isOpOldVersion(opDoc.name, opDocs);
            if (this.isPrivateOp(opDoc.name))
            {
                opDoc.hidden = false;
            }
            else
            {
                if (opDoc.oldVersion) opDoc.hidden = true;
            }

            if (forceUpdate || !opDoc.hasOwnProperty("versions")) opDoc.versions = this.getOpVersionNumbers(opDoc.name, opDocs);

            opDoc.newestVersion = null;
            if (opDoc.versions)
            {
                opDoc.newestVersion = opDoc.versions[opDoc.versions.length - 1];
            }
        });
        return opDocs;
    }

    buildOpDocsForCollection(collectionName, singleOpName = false)
    {
        const collectionFile = this.getCollectionOpDocFile(collectionName);
        let collectionOps = this.getCollectionOpNames(collectionName);
        let collectionDocs = this._docsUtil.getCollectionOpDocs(collectionName);
        let rebuildOps = collectionOps;
        if (singleOpName) rebuildOps = rebuildOps.filter((name) => { return name === singleOpName; });
        const newOpDocs = [];
        collectionOps.forEach((opName) =>
        {
            if (rebuildOps.includes(opName))
            {
                newOpDocs.push(this._docsUtil.buildOpDocs(opName));
            }
            else
            {
                const opDocs = collectionDocs.find((docs) => { return docs.name === opName; });
                if (opDocs)
                {
                    newOpDocs.push(opDocs);
                }
                else
                {
                    newOpDocs.push(this._docsUtil.buildOpDocs(opName));
                }
            }
        });
        if (newOpDocs.length > 0)
        {
            jsonfile.writeFileSync(collectionFile, newOpDocs, { "encoding": "utf-8", "spaces": 4 });
        }
        else if (fs.existsSync(collectionFile))
        {
            fs.removeSync(collectionFile);
        }
        return newOpDocs;
    }

    addOpDocsForCollections(opNames, opDocs = [], forceRebuild = false)
    {
        const allOpDocs = [...opDocs];
        const collections = {};
        opNames.forEach((opName) =>
        {
            if (this.isCoreOp(opName)) return;
            const collectionName = this.getCollectionName(opName);
            if (!collections.hasOwnProperty(collectionName)) collections[collectionName] = [];
            collections[collectionName].push(opName);
        });
        Object.keys(collections).forEach((collectionName) =>
        {
            const collectionFile = this.getCollectionOpDocFile(collectionName);
            if (!fs.existsSync(collectionFile) || forceRebuild)
            {
                if (forceRebuild) this._log.info("forced recreation of cache for", collectionName);
                this.buildOpDocsForCollection(collectionName);
            }
            let cacheDocs = [];
            try
            {
                if (fs.existsSync(collectionFile))
                {
                    cacheDocs = JSON.parse(fs.readFileSync(collectionFile, { "encoding": "utf8" }));
                }
            }
            catch (e)
            {
                this._log.warn("failed to read collection opdocs from", collectionFile, e);
            }
            cacheDocs.forEach((cacheDoc) =>
            {
                // keep this to update cache during runtime...
                const cachedName = this.getOpIdByObjName(cacheDoc.name);
                if (opNames.some((name) => { return cacheDoc.name.startsWith(name); })) allOpDocs.push(cacheDoc);
            });
        });
        return [...new Set(allOpDocs.map((obj) => { return obj; }))];
    }


    getOpLibs(opName)
    {
        const p = this.getOpAbsoluteFileName(opName);
        try
        {
            const o = jsonfile.readFileSync(p + "on");
            if (o && o.libs) return o.libs;
        }
        catch (e) {}
        return [];
    }

    getOpCoreLibs(opName)
    {
        const p = this.getOpAbsoluteFileName(opName);
        try
        {
            const o = jsonfile.readFileSync(p + "on");
            if (o && o.coreLibs) return o.coreLibs;
        }
        catch (e) {}
        return [];
    }

    getPatchOpNamespace(opName)
    {
        if (!opName || !this.isPatchOp(opName)) return null;
        let namespace = opName.split(".", 3).join(".");
        Object.keys(this.PATCHOPS_ID_REPLACEMENTS).forEach((key) =>
        {
            namespace = namespace.replaceAll(key, this.PATCHOPS_ID_REPLACEMENTS[key]);
        });
        return namespace + ".";
    }

    getPatchOpsNamespaceForProject(proj)
    {
        if (!proj || !proj.shortId) return null;
        let namespace = proj.shortId;
        Object.keys(this.PATCHOPS_ID_REPLACEMENTS).forEach((key) =>
        {
            namespace = namespace.replaceAll(key, this.PATCHOPS_ID_REPLACEMENTS[key]);
        });
        return this.PREFIX_PATCHOPS + namespace + ".";
    }

    getUserNamespace(username)
    {
        return this.PREFIX_USEROPS + this._helperUtil.sanitizeUsername(username) + ".";
    }

    getAllPatchOpNames()
    {
        let opNames = [];

        const opsPath = this._cables.getPatchOpsPath();
        if (fs.existsSync(opsPath))
        {
            const patches = fs.readdirSync(opsPath);

            for (const i in patches)
            {
                if (this.isPatchOpNamespace(patches[i]))
                {
                    const dir = fs.readdirSync(path.join(this._cables.getPatchOpsPath(), patches[i]));
                    for (const j in dir)
                    {
                        if (this.isOpNameValid(dir[j])) opNames.push(dir[j]);
                    }
                }
            }
        }

        return opNames;
    }

    getAllUserOpNames()
    {
        const opNames = [];
        const opsPath = this._cables.getUserOpsPath();
        if (fs.existsSync(opsPath))
        {
            const dirUser = fs.readdirSync(opsPath);

            for (const i in dirUser)
            {
                if (this.isOpNameValid(dirUser[i]))
                {
                    opNames.push(dirUser[i]);
                }
            }
        }
        return opNames;
    }

    getAllExtensionOpNames()
    {
        let opNames = [];

        const opsPath = this._cables.getExtensionOpsPath();
        if (fs.existsSync(opsPath))
        {
            const extensions = fs.readdirSync(opsPath);

            for (const i in extensions)
            {
                if (this.isExtension(extensions[i]))
                {
                    const dir = fs.readdirSync(path.join(this._cables.getExtensionOpsPath(), extensions[i]));
                    for (const j in dir)
                    {
                        if (this.isOpNameValid(dir[j])) opNames.push(dir[j]);
                    }
                }
            }
        }

        return opNames;
    }

    getAllTeamOpNames()
    {
        let opNames = [];

        const opsPath = this._cables.getTeamOpsPath();
        if (fs.existsSync(opsPath))
        {
            const teams = fs.readdirSync(opsPath);

            for (const i in teams)
            {
                if (this.isTeamNamespace(teams[i]))
                {
                    const dir = fs.readdirSync(path.join(this._cables.getTeamOpsPath(), teams[i]));
                    for (const j in dir)
                    {
                        if (this.isOpNameValid(dir[j])) opNames.push(dir[j]);
                    }
                }
            }
        }

        return opNames;
    }

    getOpJsonPath(opname, createPath = false)
    {
        const dirName = this.getOpSourceDir(opname);
        const filename = path.join(dirName, opname + ".json");
        const exists = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && createPath) mkdirp.sync(dirName);
        existsPath = fs.existsSync(dirName);
        if (existsPath && !exists) jsonfile.writeFileSync(filename, { "name": opname }, { "encoding": "utf-8", "spaces": 4 });
        if (!existsPath) return null;

        return filename;
    }

    buildCode(basePath, codePrefix, filterOldVersions = false, filterDeprecated = false, opDocs = null)
    {
        if (filterOldVersions && !opDocs) opDocs = this._docsUtil.getOpDocs(filterOldVersions, filterDeprecated);
        if (!basePath || !fs.existsSync(basePath))
        {
            return "";
        }
        else
        {
            const dir = fs.readdirSync(basePath);
            const ops = [];
            for (let i = 0; i < dir.length; i++)
            {
                const dirName = dir[i];
                if (!this.isOpNameValid(dirName)) continue;
                if (codePrefix !== "none")
                {
                    if (!codePrefix && dirName.startsWith(this.PREFIX_USEROPS)) continue;
                    if (codePrefix && !dirName.startsWith(codePrefix)) continue;
                }
                if (filterDeprecated && this.isDeprecated(dirName)) continue;
                if (filterOldVersions && this.isOpOldVersion(dirName, opDocs)) continue;

                const opId = this.getOpIdByObjName(dirName);
                ops.push({ "objName": dirName, "opId": opId });
            }
            return this.buildFullCode(ops, codePrefix, filterOldVersions, filterDeprecated, opDocs);
        }
    }

    buildFullCode(ops, codePrefix, filterOldVersions = false, filterDeprecated = false, opDocs = null)
    {
        let codeNamespaces = [];
        let code = "";

        if (filterOldVersions && !opDocs) opDocs = this._docsUtil.getOpDocs(filterOldVersions, filterDeprecated);

        const opNames = [];
        ops = ops.filter((op) =>
        {
            const opName = this.getOpNameById(op.opId) || op.objName;

            if (!this.isOpNameValid(opName)) return false;
            if (codePrefix !== "none")
            {
                if (!codePrefix && opName.startsWith(this.PREFIX_USEROPS)) return false;
                if (codePrefix && !opName.startsWith(codePrefix)) return false;
            }
            if (filterDeprecated && this.isDeprecated(opName)) return false;
            if (filterOldVersions && this.isOpOldVersion(opName, opDocs)) return false;

            opNames.push(opName);
            return true;
        });

        for (const i in ops)
        {
            let fn = "";
            let opName = ops[i].objName;
            if (!ops[i].opId)
            {
                ops[i].opId = this.getOpIdByObjName(ops[i].objName);
            }
            else
            {
                opName = this.getOpNameById(ops[i].opId);
            }

            if (!fn) fn = this.getOpAbsoluteFileName(opName);

            try
            {
                const parts = opName.split(".");
                for (let k = 1; k < parts.length; k++)
                {
                    let partPartname = "";
                    for (let j = 0; j < k; j++) partPartname += parts[j] + ".";

                    partPartname = partPartname.substr(0, partPartname.length - 1);
                    codeNamespaces.push(partPartname + "=" + partPartname + " || {};");
                }

                code += this.getOpFullCode(fn, opName, ops[i].opId);
            }
            catch (e)
            {
                if (this.isCoreOp(opName))
                {
                    this._log.error("op read error:" + opName, fn, e.stacktrace);
                }
                else
                {
                    this._log.warn("op read error: " + opName, fn, e.stacktrace);
                }
            }
        }

        codeNamespaces = this._sortAndReduceNamespaces(codeNamespaces);
        let fullCode = "\"use strict\";\n\nvar CABLES=CABLES||{};\nCABLES.OPS=CABLES.OPS||{};\n\n";
        if (codeNamespaces && codeNamespaces.length > 0)
        {
            codeNamespaces[0] = "var " + codeNamespaces[0];
            fullCode += codeNamespaces.join("\n") + "\n\n";
        }

        fullCode += code;
        return fullCode;
    }

    validateAndFormatOpCode(code)
    {
        const { results } = this.cli.executeOnText(code);
        const {
            messages, errorCount, warningCount, fixableErrorCount, fixableWarningCount
        } = results[0];

        const hasFatal = messages.filter((message) => { return Boolean(message.fatal); }).length > 0;

        const status = {
            "formatedCode": this._helperUtil.removeTrailingSpaces(code),
            "error": hasFatal,
            "message": messages[0]
        };
        if (results[0].output)
        {
            status.formatedCode = this._helperUtil.removeTrailingSpaces(results[0].output);
        }
        return status;
    }

    getNamespaceHierarchyProblem(outerName, innerName)
    {
        if (!outerName || !innerName) return "Unknow op";
        if (this.getNamespace(innerName).startsWith(this.getNamespace(outerName)) || this.getNamespace(outerName).startsWith(this.getNamespace(innerName))) return false;

        if (this.isCoreOp(outerName))
        {
            if (this.isExtensionOp(innerName)) return "Core ops cannot contain extension ops.";
            if (this.isTeamOp(innerName)) return "Core ops cannot contain team ops.";
            if (this.isUserOp(innerName)) return "Core ops cannot contain user ops.";
            if (this.isPatchOp(innerName)) return "Core ops cannot contain patch ops.";
        }
        else if (this.isExtensionOp(outerName))
        {
            if (this.isExtensionOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "Extension ops cannot contain ops of other extensions.";
            if (this.isTeamOp(innerName)) return "Extension ops cannot contain team ops.";
            if (this.isUserOp(innerName)) return "Extension ops connot contain user ops.";
            if (this.isPatchOp(innerName)) return "Extension ops cannot contain patch ops.";
        }
        else if (this.isTeamOp(outerName))
        {
            if (this.isTeamOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "Team ops cannot contain ops of other teams.";
            if (this.isUserOp(innerName)) return "Team ops cannot contain user ops.";
            if (this.isPatchOp(innerName)) return "Team ops cannot contain patch ops.";
        }
        else if (this.isUserOp(outerName))
        {
            if (this.isUserOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "User ops cannot contain ops of other users.";
            if (this.isPatchOp(innerName)) return "User ops cannot contain patch ops.";
        }
        else if (this.isPatchOp(outerName))
        {
            if (this.isPatchOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "Patch ops cannot contain ops of other patches.";
        }
        else
        {
            this._log.error("unknown op type", outerName);
        }

        return false;
    }

    opExists(name)
    {
        const p = this.getOpAbsolutePath(name);
        let exists = false;
        try
        {
            exists = fs.existsSync(p);
        }
        catch (e) {}
        return exists;
    }

    opNameTaken(opName, caseSensitive = false)
    {
        if (!opName) return true;
        if (caseSensitive) return !!this.getOpIdByObjName(opName);

        const nameLookup = this._docsUtil.getCachedOpLookup();
        if (nameLookup && nameLookup.names)
        {
            const objName = opName.toLowerCase();
            const names = Object.keys(nameLookup.names).map((name) => { return name.toLowerCase(); });
            return names.includes(objName);
        }
        return true;
    }

    namespaceExistsInCore(name, opDocs)
    {
        return opDocs.some((d) => { return d.name.startsWith(name); });
    }


    existingCoreOp(opname)
    {
        if (!opname) return false;
        return this.opExists(opname) && this.isCoreOp(opname);
    }

    isOpId(id)
    {
        return uuidv4.isUUID(id);
    }

    isCoreOp(opname)
    {
        if (!opname) return false;
        return !(this.isUserOp(opname) || this.isTeamOp(opname) || this.isExtensionOp(opname) || this.isPatchOp(opname));
    }

    isUserOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_USEROPS);
    }

    isAdminOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_ADMINOPS);
    }

    isPrivateOp(opname)
    {
        if (!opname) return false;
        return this.isTeamOp(opname) || this.isPatchOp(opname) || this.isUserOp(opname);
    }

    isDevOp(opname)
    {
        if (!opname) return false;
        return opname.includes(this.INFIX_DEVOPS);
    }

    isTeamOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_TEAMOPS);
    }

    isTeamOpOfTeam(opname, team)
    {
        if (!this.isTeamOp(opname)) return false;
        if (!team) return false;
        if (!team.namespaces || team.namespaces.length === 0) return false;
        const namespace = this.getFullTeamNamespaceName(opname);
        return team.namespaces.some((ns) => { return ns.startsWith(namespace); });
    }

    isExtensionOpOfTeam(opname, team)
    {
        if (!this.isExtensionOp(opname)) return false;
        if (!team) return false;
        if (!team.extensions || team.extensions.length === 0) return false;
        const namespace = this.getExtensionNamespaceByOpName(opname);
        return team.extensions.some((ns) => { return ns.startsWith(namespace); });
    }

    isExtensionOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_EXTENSIONOPS);
    }

    isDeprecated(opname)
    {
        if (!opname) return false;
        return opname.includes(this.INFIX_DEPRECATED);
    }

    /**
     *
     * @param opname
     * @return {boolean}
     */
    isPatchOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_PATCHOPS);
    }

    isPatchOpOfProject(opname, project)
    {
        if (!this.isPatchOp(opname)) return false;
        if (!project) return false;
        return this.getPatchIdFromOpName(opname) === project.shortId;
    }

    ownsUserOp(opname, user)
    {
        if (!user) return false;
        const usernamespace = this.PREFIX_USEROPS + user.usernameLowercase + ".";
        if (opname.startsWith(usernamespace)) return true;
        return false;
    }

    isExtension(name)
    {
        if (!name) return false;
        return name.startsWith(this.PREFIX_EXTENSIONOPS);
    }

    isPatchOpNamespace(name)
    {
        if (!name) return false;
        return name.startsWith(this.PREFIX_PATCHOPS);
    }

    isCollection(name)
    {
        if (!name) return false;
        return this.isTeamNamespace(name) || this.isExtensionNamespace(name);
    }

    getCollectionDir(name)
    {
        if (this.isExtensionNamespace(name)) return this.getExtensionDir(name);
        if (this.isTeamNamespace(name)) return this.getTeamNamespaceDir(name);
        return null;
    }

    isTeamNamespace(name)
    {
        if (!name) return false;
        return name.startsWith(this.PREFIX_TEAMOPS);
    }

    isExtensionNamespace(name)
    {
        if (!name) return false;
        return name.startsWith(this.PREFIX_EXTENSIONOPS);
    }

    isOpOldVersion(opname, opDocs = null)
    {
        if (!opDocs) opDocs = this._docsUtil.getOpDocs();
        const opnameWithoutVersion = this.getOpNameWithoutVersion(opname);
        const theVersion = this.getVersionFromOpName(opname);

        for (let i = 0; i < opDocs.length; i++)
            if (opDocs[i] && opDocs[i].nameNoVersion === opnameWithoutVersion)
                if (opDocs[i].version > theVersion) return true;

        return false;
    }

    getOpCode(objName)
    {
        const fn = this.getOpAbsoluteFileName(objName);
        try
        {
            if (fn && fs.existsSync(fn))
            {
                return fs.readFileSync(fn, "utf8");
            }
        }
        catch (e)
        {
            this._log.warn("op code file not found", objName);
        }
        return null;
    }

    setOpDefaults(opname, author)
    {
        const fn = this.getOpJsonPath(opname);
        const obj = jsonfile.readFileSync(fn);
        const defaults = this.getOpDefaults(opname, author);
        if (!obj)
        {
            this._log.warn("op default error read", opname, fn);
            return;
        }
        let hasChanged = false;

        if (!obj.hasOwnProperty("authorName") && defaults.authorName)
        {
            obj.authorName = defaults.authorName;
            hasChanged = true;
        }

        if (!obj.hasOwnProperty("id"))
        {
            obj.id = defaults.id;
            hasChanged = true;
        }

        if (!obj.hasOwnProperty("created"))
        {
            obj.created = defaults.created;
            hasChanged = true;
        }

        if (hasChanged)
        {
            jsonfile.writeFileSync(fn, obj, { "encoding": "utf-8", "spaces": 4 });
        }
        return hasChanged;
    }

    getOpDefaults(opName, author)
    {
        const defaults = {
            "id": uuidv4(),
            "created": Date.now()
        };
        if (author) defaults.authorName = author.username;
        return defaults;
    }

    getNamespace(opname)
    {
        if (!opname) return "";
        const parts = opname.split(".");
        parts.length -= 1;
        return parts.join(".") + ".";
    }

    isInvisible(opName)
    {
        if (!opName) return true;
        let invisible = false;
        const namespace = this.getNamespace(opName) + ".";
        if (!this._cables.isDevEnv() && namespace.includes(this.INFIX_DEVOPS))
        {
            return true;
        }
        if (opName.includes(this.INFIX_DEPRECATED)) return true;
        for (let j = 0; j < this.INVISIBLE_NAMESPACES.length; j++)
        {
            if (namespace.startsWith(this.INVISIBLE_NAMESPACES[j]))
            {
                invisible = true;
                break;
            }
        }
        return invisible;
    }

    _sortAndReduceNamespaces(arr)
    {
        const uniq = arr.slice() // slice makes copy of array before sorting it
            .sort()
            .reduce(function (a, b)
            {
                if (a.slice(-1)[0] !== b) a.push(b); // slice(-1)[0] means last item in array without removing it (like .pop())
                return a;
            }, []); // this empty array becomes the starting value for a

        arr = uniq.sort(function (a, b)
        {
            return a.length - b.length;
        });

        return arr;
    }

    _getCLIConfig()
    {
        return {
            "fix": true,
            "envs": ["browser"],
            "useEslintrc": false,
            "globals": [
                "op",
                "gui",
                "navigator",
                "document",
                "BroadcastChannel",
                "window",
                "AudioContext",
                "CABLES",
                "XMLHttpRequest",
                "Raphael",
                "ace",
                "logStartup",
                "attachments",
                "CABLESUILOADER",
                "iziToast",
                "CGL",
                "vec2",
                "vec3",
                "vec4",
                "mat3",
                "mat4",
                "quat",
                "chroma",
                "QRCode",
                "moment",
                "introJs",
                "UndoManager",
                "Handlebars",
                "hljs",
                "tinysort",
                "loadjs",
                "MathParser",
                "socketClusterClient",
                "incrementStartup",
                "mmd"
            ],
            "env": {
                "browser": true
            },
            "parserOptions": {
                "ecmaVersion": 2020
            },
            "rules": {
                "object-property-newline": "error",
                "global-require": 1,
                "no-compare-neg-zero": 0,
                "camelcase": 0,
                "class-methods-use-this": 0,
                "no-var": 1,
                "vars-on-top": 0,
                "no-bitwise": 0,
                "no-underscore-dangle": 0,
                "brace-style": [
                    1,
                    "allman",
                    {
                        "allowSingleLine": true
                    }
                ],
                "func-names": 0,
                "max-len": [
                    0,
                    {
                        "code": 120,
                        "tabWidth": 4,
                        "comments": 300,
                        "ignoreComments": true
                    }
                ],
                "no-param-reassign": 0,
                "consistent-return": 0,
                "eqeqeq": 0,
                "one-var": 0,
                "no-unused-vars": 0,
                "no-lonely-if": 0,
                "no-plusplus": 0,
                "indent": [
                    1,
                    4
                ],
                "quotes": [
                    1,
                    "double"
                ],
                "quote-props": [
                    1,
                    "always"
                ],
                "comma-dangle": 0,
                "nonblock-statement-body-position": 0,
                "curly": 0,
                "object-shorthand": 0,
                "prefer-spread": 0,
                "no-loop-func": 0,
                "no-trailing-spaces": 1,
                "space-before-function-paren": 1,
                "space-in-parens": 1,
                "space-infix-ops": 1,
                "keyword-spacing": 1,
                "padded-blocks": 1,
                "comma-spacing": 1,
                "space-before-blocks": 1,
                "spaced-comment": 1,
                "object-curly-spacing": 1,
                "object-curly-newline": 0,
                "implicit-arrow-linebreak": 0,
                "operator-linebreak": 0,
                "array-element-newline": 0,
                "function-paren-newline": 0,
                "no-self-compare": 0,
                "no-case-declarations": 0,
                "default-case": 0,
                "no-empty": 0,
                "no-use-before-define": 0,
                "no-multi-assign": 0,
                "no-extend-native": 0,
                "no-prototype-builtins": 0,
                "array-callback-return": 1,
                "prefer-destructuring": 0,
                "no-restricted-syntax": ["error", "TemplateLiteral"],
                "no-restricted-globals": 0,
                "no-continue": 0,
                "no-console": 1,
                "no-else-return": 0,
                "one-var-declaration-per-line": 0,
                "guard-for-in": 0,
                "no-new": 0,
                "radix": 0,
                "no-template-curly-in-string": 0,
                "no-useless-constructor": 0,
                "import/no-dynamic-require": 0,
                "import/no-cycle": [
                    1,
                    {
                        "maxDepth": 3
                    }
                ],
                "prefer-template": 0,
                "prefer-rest-params": 0,
                "no-restricted-properties": 0,
                "import/prefer-default-export": 0,
                "import/no-default-export": 0,
                "prefer-arrow-callback": 0,
                "arrow-body-style": ["error", "always"],
                "new-cap": 0,
                "prefer-const": 0,
                "padding-line-between-statements": [
                    1,
                    {
                        "blankLine": "always",
                        "prev": "function",
                        "next": "*"
                    }
                ],
                "no-return-await": 0
            }
        };
    }

    getExampleScreenshotPath(opName)
    {
        const opPath = this.getOpAbsolutePath(opName);
        return path.join(opPath, "/screenshot.png");
    }

    getOpSourceDir(opName)
    {
        if (opName.endsWith(".")) opName = opName.substring(0, opName.length - 1);
        if (this.isUserOp(opName))
        {
            return path.join(this._cables.getUserOpsPath(), opName, "/");
        }
        else if (this.isCollection(opName))
        {
            return path.join(this.getCollectionDir(opName), opName, "/");
        }
        else if (this.isPatchOp(opName))
        {
            return path.join(this.getPatchOpDir(opName), opName, "/");
        }
        else
        {
            return path.join(this._cables.getCoreOpsPath(), opName, "/");
        }
    }

    getTeamNamespaceDir(name)
    {
        let teamNameSpace = this.getTeamNamespaceByOpName(name);
        if (!name || !teamNameSpace) return null;

        if (!teamNameSpace.startsWith(this.PREFIX_TEAMOPS))
        {
            // shortname given
            teamNameSpace = this.PREFIX_TEAMOPS + name;
        }
        if (teamNameSpace.endsWith(".")) teamNameSpace = teamNameSpace.substring(0, teamNameSpace.length - 1);
        const teamNamespacePath = path.join(this._cables.getTeamOpsPath(), "/", teamNameSpace, "/");
        return path.join(teamNamespacePath, "/");
    }

    getExtensionDir(name)
    {
        let extensionName = this.getExtensionNamespaceByOpName(name);
        if (extensionName.endsWith(".")) extensionName = extensionName.substring(0, extensionName.length - 1);
        const extensionPath = path.join(this._cables.getExtensionOpsPath(), "/", extensionName, "/");
        return path.join(extensionPath, "/");
    }

    getPatchOpDir(name)
    {
        const patchOpDir = name ? name.split(".", 3).join(".") : null;
        const extensionPath = path.join(this._cables.getPatchOpsPath(), "/", patchOpDir, "/");
        return path.join(extensionPath, "/");
    }

    getCollectionJsonPath(name, create = true)
    {
        let filename = this.getExtensionJsonPath(name, create);
        if (!filename) filename = this.getTeamNamespaceJsonPath(name, create);
        return filename;
    }

    getCollectionDocs(name)
    {
        const file = this.getCollectionJsonPath(name, false);
        let docs = {};
        if (fs.existsSync(file)) docs = jsonfile.readFileSync(file);
        return docs;
    }

    getTeamNamespaceJsonPath(name, create = true)
    {
        const dirName = this.getTeamNamespaceDir(name);
        let extName = this.getTeamNamespaceByOpName(name);
        if (extName.endsWith(".")) extName = extName.substring(0, extName.length - 1);
        const filename = path.join(dirName, extName + ".json");
        const exists = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && create)
        {
            mkdirp.sync(dirName);
            existsPath = fs.existsSync(dirName);
        }
        if (existsPath && !exists && create) jsonfile.writeFileSync(filename, { "name": name }, { "encoding": "utf-8", "spaces": 4 });
        if (!existsPath) return null;
        return filename;
    }

    getExtensionJsonPath(name, create = true)
    {
        const dirName = this.getExtensionDir(name);
        let extName = this.getExtensionNamespaceByOpName(name);
        if (extName.endsWith(".")) extName = extName.substring(0, extName.length - 1);
        const filename = path.join(dirName, extName + ".json");
        const exists = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && create)
        {
            mkdirp.sync(dirName);
            existsPath = fs.existsSync(dirName);
        }
        if (existsPath && !exists && create) jsonfile.writeFileSync(filename, { "name": name }, { "encoding": "utf-8", "spaces": 4 });
        if (!existsPath) return null;
        return filename;
    }

    getCollectionName(opName)
    {
        return opName ? opName.split(".", 3).join(".") : null;
    }

    getCollectionNamespace(opName)
    {
        return this.getCollectionName(opName) + ".";
    }

    getCollectionOpDocFile(collectionName)
    {
        if (collectionName.endsWith(".")) collectionName = collectionName.substring(0, collectionName.length - 1);
        return path.join(this._cables.getOpDocsCachePath() + collectionName + ".json");
    }

    getCollectionOpNames(collectionName, filterInvisibleOps = false)
    {
        let opNames = [];
        let dir = this._cables.getUserOpsPath();
        if (this.isPatchOpNamespace(collectionName)) dir = this.getPatchOpDir(collectionName);
        if (this.isCollection(collectionName)) dir = this.getCollectionDir(collectionName);

        if (fs.existsSync(dir))
        {
            const dirContents = fs.readdirSync(dir);
            dirContents.forEach((dirContent) =>
            {
                if (this.isOpNameValid(dirContent) && dirContent.startsWith(collectionName))
                {
                    // keep this to update cache during runtime...
                    this.getOpIdByObjName(dirContent);
                    opNames.push(dirContent);
                }
            });
        }
        if (filterInvisibleOps) opNames = opNames.filter((opName) => { return !this.isInvisible(opName); });
        return opNames;
    }

    getPatchIdFromOpName(opName)
    {
        if (!opName) return null;
        let namespace = opName.split(".", 3).join(".");
        Object.keys(this.PATCHOPS_ID_REPLACEMENTS).forEach((key) =>
        {
            namespace = namespace.replaceAll(this.PATCHOPS_ID_REPLACEMENTS[key], key);
        });
        return namespace.replace(this.PREFIX_PATCHOPS, "");
    }

    getExtensionNamespaceByOpName(opName)
    {
        return opName ? opName.split(".", 3).join(".") + "." : null;
    }

    getTeamNamespaceByOpName(opName)
    {
        return opName ? opName.split(".", 3).join(".") + "." : null;
    }

    getExtensionShortName(extensionName)
    {
        const parts = extensionName.split(".", 3);
        return parts[2] || extensionName;
    }

    getTeamNamespaceShortName(namespaceName)
    {
        const parts = namespaceName.split(".", 3);
        return parts[2] || namespaceName;
    }

    getFullTeamNamespaceName(shortName)
    {
        let name = shortName;
        if (!name.endsWith(".")) name += ".";
        if (!name.startsWith(this.PREFIX_TEAMOPS))
        {
            return this.PREFIX_TEAMOPS + this._teamsUtil.sanitizeShortNameForNamespace(name) + ".";
        }
        return this.getTeamNamespaceByOpName(name);
    }

    deleteOp(opName)
    {
        const fn = this.getOpAbsoluteFileName(opName);
        if (fn)
        {
            try
            {
                if (fs.existsSync(fn))
                {
                    fs.unlinkSync(fn);
                    this._docsUtil.removeOpNameFromLookup(opName);
                }
                try
                {
                    fs.rmSync(this.getOpAbsolutePath(opName), { "recursive": true, "force": true });
                }
                catch (e)
                {
                    this._log.error(e);
                    return false;
                }
                this._docsUtil.updateOpDocs(opName);
            }
            catch (e)
            {
                this._log.error(e);
                return false;
            }
            return true;
        }
        return false;
    }

    updateOpCode(opName, author, code)
    {
        const fn = this.getOpAbsoluteFileName(opName);
        let returnedCode = this._helperUtil.removeTrailingSpaces(code);
        fs.writeFileSync(fn, returnedCode);
        const jsonFile = this.getOpJsonPath(opName);
        let jsonData = jsonfile.readFileSync(jsonFile);
        if (!jsonData) jsonData = {};
        if (jsonData.updated) delete jsonData.updated;
        jsonfile.writeFileSync(jsonFile, jsonData, { "encoding": "utf-8", "spaces": 4 });
        this.setOpDefaults(opName, author);
        return returnedCode;
    }

    updateAttachment(opName, attName, content, force = false, res = false)
    {
        if (res) res.startTime("sanitizeFileName");
        let p = this.getOpAbsolutePath(opName);
        console.log("APP", p);
        p += sanitizeFileName(attName);
        if (res) res.endTime("sanitizeFileName");

        if (this.existingCoreOp(opName))
        {
            if (p.endsWith(".js"))
            {
                if (res) res.startTime("validateAndFormatOpCode");
                const format = this.validateAndFormatOpCode(content);
                if (res) res.endTime("validateAndFormatOpCode");
                content = format.formatedCode;
            }
        }
        if (res) res.startTime("removeTrailingSpaces");
        content = this._helperUtil.removeTrailingSpaces(content);
        if (res) res.endTime("removeTrailingSpaces");

        let subPatchProblems = null;
        if (attName === this.SUBPATCH_ATTACHMENT_NAME)
        {
            try
            {
                const subPatch = JSON.parse(content);
                if (res) res.startTime("getNamespaceHierarchyProblem");
                subPatchProblems = this._subPatchOpUtil.getSaveSubPatchOpProblems(opName, subPatch);
                if (res) res.endTime("getNamespaceHierarchyProblem");
            }
            catch (e)
            {
                this._log.error("failed to parse subpatch attachment", opName);
            }
        }

        if (!subPatchProblems || force)
        {
            if (res) res.startTime("writeFile");
            fs.writeFileSync(p, content, "utf8");
            if (res) res.endTime("writeFile");
        }
        return subPatchProblems;
    }

    deleteAttachment(opName, attName)
    {
        if (!opName || !attName) return false;
        if (!attName.startsWith("att_")) attName = "att_" + attName;
        let p = this.getOpAbsolutePath(opName);
        if (p)
        {
            p += sanitizeFileName(attName);
            if (!fs.existsSync(p)) return false;
            fs.unlinkSync(p);
            this._log.info("deleted attachment!", p);
            return true;
        }
        else
        {
            return false;
        }
    }

    getSubPatchOpAttachment(opName)
    {
        let attachmentData = this.getAttachment(opName, this.SUBPATCH_ATTACHMENT_NAME);
        let subPatchData = { "ops": [] };
        if (attachmentData)
        {
            try
            {
                subPatchData = JSON.parse(attachmentData);
                if (subPatchData.ops)
                {
                    subPatchData.ops.forEach((attachmentOp) =>
                    {
                        // FIXME: this is somehow not good, maybe store in opjson?
                        if (!attachmentOp.hasOwnProperty("storage")) attachmentOp.storage = {};
                        attachmentOp.storage.blueprintVer = 2;
                    });
                }
            }
            catch (e)
            {
                this._log.error("failed to json parse subpatch attachment", opName, this.SUBPATCH_ATTACHMENT_NAME, attachmentData);
                subPatchData = { "ops": [] };
            }
        }
        return subPatchData;
    }
}

