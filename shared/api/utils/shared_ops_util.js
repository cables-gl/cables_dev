import jsonfile from "jsonfile";
import fs from "fs-extra";
import eslint from "eslint";
import path from "path";
import uuidv4 from "uuid-v4";
import mkdirp from "mkdirp";
import sanitizeFileName from "sanitize-filename";
import eslintAirbnbBase from "eslint-config-airbnb-base";
import tokenString from "glsl-tokenizer/string.js";
import XMLWriter from "xml-writer";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedOpsUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);

        this._CLIEngine = eslint.CLIEngine;

        jsonfile.spaces = 4;

        this.PREFIX_OPS = "Ops.";
        this.PREFIX_USEROPS = "Ops.User.";
        this.PREFIX_TEAMOPS = "Ops.Team.";
        this.PREFIX_EXTENSIONOPS = "Ops.Extension.";
        this.PREFIX_PATCHOPS = "Ops.Patch.P";

        this.INFIX_DEPRECATED = ".Deprecated.";
        this.INFIX_DEVOPS = ".Dev.";
        this.INFIX_STANDALONEOPS = ".Standalone.";

        this.SUFFIX_VERSION = "_v";

        this.PATCHOPS_ID_REPLACEMENTS = {
            "-": "___"
        };

        this.FXHASH_OP_NAME = "Ops.Extension.FxHash.FxHash";

        this.SUBPATCH_ATTACHMENT_NAME = "att_subpatch_json";
        this.SUBPATCH_ATTACHMENT_PORTS = "att_ports.json";

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
                },
                {
                    "ns": "Ops.Array",
                    "summary": "working with array3 or pointarrays, arrays that contain XYZ coordinate/point data"
                }
            ];

        this.INVISIBLE_NAMESPACES = [
            this.PREFIX_USEROPS
        ];

        this.VISIBILITY_PUBLIC = "public";
        this.VISIBILITY_UNLISTED = "unlisted";
        this.VISIBILITY_PRIVATE = "private";
        this.VISIBILITY_HIDDEN = "hidden";
        this.OPS_CODE_PREFIX = "\"use strict\";\n\nvar CABLES=CABLES||{};\nCABLES.OPS=CABLES.OPS||{};\n\n";

        this.cli = new this._CLIEngine(this._getCLIConfig());
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

    isVariableSetter(opname)
    {
        if (!opname) return false;
        return opname.startsWith("Ops.Vars.VarSet") || opname.startsWith("Ops.Vars.VarTrigger");
    }

    isCallbackOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith("Ops.Cables.Callback");
    }

    isFunctionOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith("Ops.Cables.Function");
    }

    isSubPatch(opname)
    {
        if (!opname) return false;
        return opname.startsWith("Ops.Ui.SubPatch");
    }

    isSubPatchOp(op)
    {
        if (!op || !op.storage) return false;
        if (op.storage.blueprintVer > 1) return true;
        return !!op.storage.subPatchVer;
    }

    getOpAbsoluteJsonFilename(opName)
    {
        const p = this.getOpAbsolutePath(opName);
        if (!p) return null;
        return path.join(p, "/", this.getOpJsonFilename(opName));
    }

    getOpJsonFilename(opName)
    {
        if (!opName) return null;
        return opName + ".json";
    }

    getOpAbsolutePath(opName)
    {
        if (!opName) return null;
        if (!this.isOpNameValid(opName)) return null;

        return this.getOpSourceDir(opName);
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
        if (!opname) return "";
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

    getOpInfo(opName)
    {
        let info = {};

        const opPath = this.getOpAbsolutePath(opName);
        if (opPath)
        {
            const jsonFilename = path.join(opPath, opName + ".json");
            const screenshotFilename = path.join(opPath, "screenshot.png");
            let screenshotExists = false;
            if (screenshotFilename) screenshotExists = fs.existsSync(screenshotFilename);
            try
            {
                info = jsonfile.readFileSync(jsonFilename);
                info.hasScreenshot = screenshotExists;
                info.shortName = opName.split(".")[opName.split(".").length - 1];
                info.hasExample = !!info.exampleProjectId;
            }
            catch (e)
            {
            }
        }

        info.doc = this._docsUtil.getOpDocMd(opName);
        return info;
    }

    _writeOpChangelog(opName, changes, update = false)
    {
        const filename = this.getOpAbsoluteJsonFilename(opName);
        if (fs.existsSync(filename))
        {
            const obj = jsonfile.readFileSync(filename);
            if (obj)
            {
                if (update)
                {
                    obj.changelog = changes || [];
                }
                else
                {
                    obj.changelog = obj.changelog || [];
                    obj.changelog = obj.changelog.concat(changes);
                }
                obj.changelog = obj.changelog.sort((a, b) => { return a.date - b.date; });
                jsonfile.writeFileSync(filename, obj, { "encoding": "utf-8", "spaces": 4 });
            }
        }
    }

    addOpChangelog(user, opName, newEntry, referenceDate = null, update = false)
    {
        let changes = [];
        if (update && referenceDate !== null)
        {
            const opDocs = this._docsUtil.getDocForOp(opName);
            if (opDocs)
            {
                const timestamp = Number(referenceDate);
                const changelog = opDocs.changelog || [];
                const oldEntry = changelog.find((change) => { return change.hasOwnProperty("date") && change.date === timestamp; });
                if (oldEntry)
                {
                    if (newEntry.message) oldEntry.message = newEntry.message;
                    if (newEntry.hasOwnProperty("type"))
                    {
                        if (newEntry.type)
                        {
                            oldEntry.type = newEntry.type;
                        }
                        else
                        {
                            delete oldEntry.type;
                        }
                    }
                    if (newEntry.hasOwnProperty("date"))
                    {
                        if (newEntry.date)
                        {
                            if (this._helperUtil.isNumeric(newEntry.date))
                            {
                                oldEntry.date = Number(newEntry.date) || Date.now();
                            }
                            else
                            {
                                oldEntry.date = Date.now();
                            }
                        }
                        else
                        {
                            oldEntry.date = Date.now();
                        }
                    }
                }
                changes = changelog;
            }
        }
        else
        {
            const change = {
                "message": newEntry.message,
                "type": newEntry.type,
                "author": user.username,
                "date": Date.now()
            };
            changes.push(change);
            const logStr = "*" + user.username + "* added changelog " + opName + " - https://cables.gl/op/" + opName;
            this._log.info(logStr);
        }
        this._writeOpChangelog(opName, changes, update);
    }

    removeOpChangelog(user, opName, date)
    {
        if (date)
        {
            const opDocs = this._docsUtil.getDocForOp(opName);
            if (opDocs)
            {
                const timestamp = Number(date);
                const changelog = opDocs.changelog || [];
                const oldEntryIndex = changelog.findIndex((change) => { return change.hasOwnProperty("date") && change.date === timestamp; });
                if (oldEntryIndex !== -1)
                {
                    changelog.splice(oldEntryIndex, 1);
                    this._writeOpChangelog(opName, changelog, true);
                }
            }
        }
    }

    getOpFullCode(fn, opName, opId, prepareForExport = false, minifyGlsl = false)
    {
        if (!fn || !opName || !opId) return "";

        try
        {
            const code = fs.readFileSync(fn, "utf8");
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
                else if (dir[i] === this.SUBPATCH_ATTACHMENT_PORTS)
                {
                    if (prepareForExport) continue;
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8")) + ",";
                }
                else if (dir[i] === this.SUBPATCH_ATTACHMENT_NAME)
                {
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    let content = fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8");
                    if (prepareForExport)
                    {
                        try
                        {
                            let subPatch = JSON.parse(content);
                            subPatch = this._projectsUtil.makeExportable(subPatch);
                            subPatch = JSON.stringify(subPatch);
                            content = subPatch;
                        }
                        catch (e)
                        {
                            this._log.error("failed to parse", this.SUBPATCH_ATTACHMENT_NAME, "during minify, keeping unminified", e);
                        }
                    }
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(content) + ",";
                }
                else if (dir[i].startsWith("att_"))
                {
                    let attachment = fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8");
                    if (minifyGlsl && (dir[i].endsWith(".att") || dir[i].endsWith(".frag")))
                    {
                        try
                        {
                            attachment = this._minifyGlsl(attachment);
                        }
                        catch (e)
                        {
                            this._log.warn("failed to minify glsl, keeping unminified", opName, dir[i], e);
                        }
                    }
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(attachment) + ",";
                }
            }

            codeAttachments += "};\n";

            const codeHead = "\n\n// **************************************************************\n" +
                "// \n" +
                "// " + opName + "\n" +
                "// \n" +
                "// **************************************************************\n\n" +
                opName + " = function()\n{\nCABLES.Op.apply(this,arguments);\nconst op=this;\n";
            let codeFoot = "\n\n};\n\n" + opName + ".prototype = new CABLES.Op();\n";

            if (opId) codeFoot += "CABLES.OPS[\"" + opId + "\"]={f:" + opName + ",objName:\"" + opName + "\"};";
            codeFoot += "\n\n\n";

            return codeHead + codeAttachments + codeAttachmentsInc + code + codeFoot;
        }
        catch (e)
        {
            this._log.warn("getfullopcode fail", fn, opName);
            this._docsUtil.removeOpNameFromLookup(opName);
        }
        return "";
    }

    getOpCodeWarnings(opName, jsFile = null)
    {
        const info = this.getOpInfo(opName);

        const blendmodeWarning = ": use `{{CGL.BLENDMODES}}` in your shader and remove all manual replace code";
        const srcWarnings = [];
        const fn = this.getOpAbsoluteFileName(opName);
        if (!this.isUserOp(opName))
        {
            const parts = opName.split(".");
            for (let i = 0; i < parts.length; i++)
            {
                if (parts[i].charAt(0) !== parts[i].charAt(0).toUpperCase())
                {
                    srcWarnings.push({
                        "type": "name",
                        "id": "lowercase",
                        "text": "all namespace parts have to be capitalized"
                    });
                }
            }
        }

        if (jsFile || fs.existsSync(fn))
        {
            let code = jsFile || fs.readFileSync(fn, "utf8");

            if (!info.id) srcWarnings.push({
                "type": "json",
                "id": "noId",
                "text": "has no op id"
            });
            if (!info) srcWarnings.push({
                "type": "json",
                "id": "noJson",
                "text": "has no json"
            });
            else
            {
                if (!info.layout) srcWarnings.push({
                    "type": "json",
                    "id": "noLayout",
                    "text": "has no layout"
                });
                if (!info.authorName || info.authorName === "") srcWarnings.push({
                    "type": "json",
                    "id": "noAuthor",
                    "text": "has no author"
                });
            }

            if (code.indexOf("void main()") > -1) srcWarnings.push({
                "type": "code",
                "id": "inlineShaderCode",
                "text": "found shader code in the .js, should be put to an attachment"
            });

            if (code.indexOf("self.") > -1) srcWarnings.push({
                "type": "code",
                "id": "self",
                "text": ""
            });

            if (code.indexOf("cgl.mvMatrix") > -1) srcWarnings.push({
                "type": "code",
                "id": "mvMatrix",
                "text": "use of `MvMatrix` is deprecated, use cgl.mMatrix / cgl.vMatrix instead."
            });

            if (code.indexOf("OP_PORT_TYPE_TEXTURE") > -1) srcWarnings.push({
                "type": "code",
                "id": "texturePortType",
                "text": "use `op.inTexture(\"name\")` to create a texture port "
            });

            if (opName.indexOf("Ops.Gl.ImageCompose") >= 0 && code.indexOf("checkOpInEffect") == -1 && opName.indexOf("ImageCompose") == -1) srcWarnings.push({
                "type": "code",
                "id": "no_check_effect",
                "text": "every textureEffect op should use `if(!CGL.TextureEffect.checkOpInEffect(op)) return;` in the rendering function to automatically show a warning to the user if he is trying to use it outside of an imageCompose"
            });

            if (code.indexOf(".onValueChange") > -1) srcWarnings.push({
                "type": "code",
                "id": "onValueChanged",
                "text": "do not use `port.onValueChanged=`, now use `port.onChange=`"
            });

            if (code.indexOf(".inValueEditor") > -1) srcWarnings.push({
                "type": "code",
                "id": "inValueEditor",
                "text": "do not use `op.inValueEditor()`, now use `op.inStringEditor()`"
            });

            if (code.indexOf(".inFile") > -1) srcWarnings.push({
                "type": "code",
                "id": "inFile",
                "text": "do not use `op.inFile()`, now use `op.inUrl()`"
            });

            if (code.indexOf("op.outValue") > -1) srcWarnings.push({
                "type": "code",
                "id": "op.outValue",
                "text": "use `op.outNumber`, or `op.outString` "
            });

            if (code.indexOf("\"use strict\";") > -1) srcWarnings.push({
                "type": "code",
                "id": "use strict",
                "text": "\"use strict\"; is not needed, remove it!"
            });

            if (code.indexOf("\nvar ") > -1) srcWarnings.push({
                "type": "code",
                "id": "var",
                "text": "use `let`, or `const` "
            });

            if (code.indexOf(".val=") > -1 || code.indexOf(".val =") > -1 || code.indexOf(".val;") > -1) srcWarnings.push({
                "type": "code",
                "id": ".val",
                "text": "do not use `port.val`, now use `port.get()`"
            });

            if (code.indexOf("op.addInPort(") > -1) srcWarnings.push({
                "type": "code",
                "id": "port",
                "text": "use `op.inValue` or `op.inTrigger` etc. to create ports..."
            });

            if (code.indexOf("colorPick: 'true'") > -1 || code.indexOf("colorPick:'true'") > -1) srcWarnings.push({
                "type": "code",
                "id": "colorpick",
                "text": "how to create a colorpicker the nice way: \n const r = op.inValueSlider(\"r\", Math.random());\n\nconst g = op.inValueSlider(\"g\", Math.random());\nconst b = op.inValueSlider(\"b\", Math.random()); \nr.setUiAttribs({ colorPick: true }); "
            });

            if (code.indexOf("blendMode.onChange") > -1) srcWarnings.push({
                "type": "code",
                "id": "blendmode",
                "text": "do not directly set `.onChange` for blendMode select. use this now: `CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);`"
            });

            if (code.indexOf("op.outFunction") > -1) srcWarnings.push({
                "type": "code",
                "id": "outFunction",
                "text": "use `op.outTrigger` instead of `op.outFunction` "
            });
            if (code.indexOf("op.inFunction") > -1) srcWarnings.push({
                "type": "code",
                "id": "inFunction",
                "text": "use `op.inTrigger` instead of `op.inFunction` "
            });

            if (code.indexOf("{{BLENDCODE}}") > -1) srcWarnings.push({
                "type": "shadercode",
                "id": "blendmode",
                "text": blendmodeWarning
            });

            // remove comments, before checking for console usage
            code = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");
            if (code.indexOf("console.log") > -1) srcWarnings.push({
                "type": "code",
                "id": "console.log",
                "text": "use `op.log`, not `console.log` "
            });

            const atts = this.getAttachmentFiles(opName);

            for (let i = 0; i < atts.length; i++)
            {
                if (atts[i].indexOf(".frag") > -1)
                {
                    const opFn = path.join(this.getOpAbsolutePath(opName), atts[i]);
                    const att = fs.readFileSync(opFn, "utf8");

                    if (att.indexOf("gl_FragColor") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "gl_FragColor",
                        "text": atts[i] + ": use `outColor=vec4();` instead of gl_FragColor."
                    });
                    if (att.indexOf("texture2D(") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "texture2D ",
                        "text": atts[i] + ": do not set `texture2D`, use `texture()`"
                    });
                    if (att.indexOf(" uniform") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "uniform ",
                        "text": atts[i] + ": use `UNI` instead of `uniform`"
                    });
                    if (att.indexOf("{{BLENDCODE}}") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "blendmode",
                        "text": atts[i] + blendmodeWarning
                    });

                    if (att.indexOf("_blend(base.rgb,col.rgb)") > -1) srcWarnings.push({
                        "type": "shadercode",
                        "id": "blending",
                        "text": atts[i] + " use `outColor=cgl_blend(oldColor,newColor,amount);`"
                    });
                }
            }
        }

        return srcWarnings;
    }

    getOpAbsoluteFileName(opName)
    {
        if (this.isOpNameValid(opName))
        {
            return path.join(this.getOpAbsolutePath(opName), this.getOpFileName(opName));
        }
        return null;
    }

    getOpFileName(opName)
    {
        return opName + ".js";
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
            if (fs.existsSync(dirName)) this._log.warn("getattachmentfiles exception ", opName, e.message);
        }

        return attachmentFiles;
    }

    getAttachment(opName, attachmentName)
    {
        if (!opName || !attachmentName) return null;
        let attachment = null;
        const attachmentFiles = this.getAttachmentFiles(opName);

        const dirName = this.getOpAbsolutePath(opName);
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
        return attachment;
    }

    userHasWriteRightsOp(user, opName, teams = [], project = null, ignoreAdmin = false)
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
            // and team members with full access
            if (project.users && project.users.indexOf(user._id) > -1) return true;
            if (project.userId == user._id) return true;
            if (teams)
            {
                for (let i = 0; i < teams.length; i++)
                {
                    if (teams[i].projects)
                    {
                        for (let j = 0; j < teams[i].projects.length; j++)
                        {
                            const teamProject = teams[i].projects[j];
                            if (String(teamProject._id) === String(project._id) && this._teamsUtil.userHasWriteAccess(user, teams[i])) return true;
                        }
                    }
                }
            }
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
        if (!ignoreAdmin && user.isStaff)
        {
            // only staff and admins are allowed to edit everything else on dev
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
        this._docsUtil.addOpsToLookup(newOpDocs);
        return newOpDocs;
    }

    addOpDocsForCollections(opNames, opDocs = [], forceRebuild = false)
    {
        const allOpDocs = [...opDocs];
        const collections = {};
        opNames.forEach((opName) =>
        {
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
                if (cacheDoc)
                {
                    const cachedName = this.getOpIdByObjName(cacheDoc.name);
                    if (opNames.some((name) => { return cacheDoc.name.startsWith(name); })) allOpDocs.push(cacheDoc);
                }
            });
        });
        const newOpDocs = [];
        const newOps = [];
        allOpDocs.forEach((opDoc) =>
        {
            if (!newOps.includes(opDoc.name))
            {
                newOpDocs.push(opDoc);
                newOps.push(opDoc.name);
            }
        });
        return newOpDocs;
    }


    getOpLibs(opName)
    {
        const p = this.getOpAbsoluteJsonFilename(opName);
        try
        {
            const o = jsonfile.readFileSync(p);
            if (o && o.libs) return o.libs;
        }
        catch (e) {}
        return [];
    }

    getOpCoreLibs(opName)
    {
        const p = this.getOpAbsoluteJsonFilename(opName);
        try
        {
            const o = jsonfile.readFileSync(p);
            if (o && o.coreLibs) return o.coreLibs;
        }
        catch (e) {}
        return [];
    }

    addOpDependency(opName, newDependency)
    {
        if (!opName || !newDependency) return false;
        const opDocFile = this.getOpAbsoluteJsonFilename(opName);
        if (fs.existsSync(opDocFile))
        {
            let opDoc = jsonfile.readFileSync(opDocFile);
            if (opDoc)
            {
                const deps = opDoc.dependencies || [];
                if (newDependency.type === "op" && !this.isOpId(newDependency.src))
                {
                    newDependency.src = this.getOpIdByObjName(newDependency.src);
                }
                if (!deps.some((d) => { return d.src === newDependency.src && d.type === newDependency.type; }))
                {
                    deps.push(newDependency);
                }

                opDoc.dependencies = deps;
                opDoc = this._docsUtil.cleanOpDocData(opDoc);
                jsonfile.writeFileSync(opDocFile, opDoc, { "encoding": "utf-8", "spaces": 4 });
                this._docsUtil.updateOpDocs(opName);
                return true;
            }
            else
            {
                return false;
            }
        }
        return false;
    }

    removeOpDependency(opName, dep)
    {
        if (!opName || !dep) return false;

        const opDocFile = this.getOpAbsoluteJsonFilename(opName);
        if (dep.src && dep.src.startsWith("./"))
        {
            const depFile = path.join(this.getOpAbsolutePath(opName), dep.src);
            if (fs.existsSync(depFile)) fs.unlinkSync(depFile);
        }
        if (fs.existsSync(opDocFile))
        {
            let opDoc = jsonfile.readFileSync(opDocFile);
            if (opDoc)
            {
                const newDeps = [];
                const deps = opDoc.dependencies || [];
                deps.forEach((d) =>
                {
                    if (!(d.src === dep.src && d.type === dep.type)) newDeps.push(d);
                });
                opDoc.dependencies = newDeps;
                if (opDoc.dependencies) jsonfile.writeFileSync(opDocFile, opDoc, { "encoding": "utf-8", "spaces": 4 });
                this._docsUtil.updateOpDocs(opName);
                return true;
            }
            else
            {
                return false;
            }
        }
        return false;
    }

    addOpDependencyFile(opName, fileName, buffer)
    {
        if (!fileName.startsWith("lib_")) fileName = "lib_" + fileName;
        fileName = this._filesUtil.realSanitizeFilename(fileName);
        const opDir = this.getOpAbsolutePath(opName);
        const absoluteFile = path.join(opDir, fileName);
        try
        {
            fs.writeFileSync(absoluteFile, buffer);
            return fileName;
        }
        catch (e)
        {
            this._log.error("failed to write opdependency file", fileName, e);
        }
        return false;
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

    getTeamOpNames(team)
    {
        let opNames = [];
        if (!team) return opNames;

        let teamNamespaces = team.namespaces || [];
        if (team.extensions) teamNamespaces = teamNamespaces.concat(team.extensions);

        teamNamespaces.forEach((teamNamespace) =>
        {
            opNames = opNames.concat(this.getCollectionOpNames(teamNamespace));
        });

        return opNames;
    }

    getOpJsonPath(opName, createPath = false)
    {
        if (!opName) return null;
        const dirName = this.getOpAbsolutePath(opName);
        if (!dirName) return null;
        const filename = path.join(dirName, opName + ".json");
        const exists = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && createPath) mkdirp.sync(dirName);
        existsPath = fs.existsSync(dirName);
        if (existsPath && !exists) jsonfile.writeFileSync(filename, { "name": opName }, { "encoding": "utf-8", "spaces": 4 });
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

    buildFullCode(ops, codePrefix, filterOldVersions = false, filterDeprecated = false, opDocs = null, prepareForExport = false, minifyGlsl = false)
    {
        let codeNamespaces = [];
        let code = "";

        if (filterOldVersions && !opDocs) opDocs = this._docsUtil.getOpDocs(filterOldVersions, filterDeprecated);

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
            return true;
        });

        for (const i in ops)
        {
            let opName = ops[i].objName;
            let opId = ops[i].opId;
            if (!opId)
            {
                opId = this.getOpIdByObjName(opName);
            }
            else
            {
                opName = this.getOpNameById(opId);
            }

            let fn = this.getOpAbsoluteFileName(opName);

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
                code += this.getOpFullCode(fn, opName, opId, prepareForExport, minifyGlsl);
            }
            catch (e)
            {
                if (this.isCoreOp(opName))
                {
                    this._log.error("op read error:" + opName, this.getOpAbsoluteFileName(opName), e.stacktrace);
                }
                else
                {
                    this._log.warn("op read error: " + opName, this.getOpAbsoluteFileName(opName), e.stacktrace);
                }
            }
        }

        codeNamespaces = this._helperUtil.sortAndReduce(codeNamespaces);
        let fullCode = this.OPS_CODE_PREFIX;
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
        const { messages } = results[0];

        const hasFatal = messages.filter((message) => { return Boolean(message.fatal); }).length > 0;

        const status = {
            "formatedCode": this._helperUtil.removeTrailingSpaces(results[0].output || code),
            "error": hasFatal,
            "message": messages[0]
        };
        return status;
    }

    getNamespaceHierarchyProblem(outerName, innerName)
    {
        if (!outerName || !innerName) return "Unknow op";
        if (this.getNamespace(innerName).startsWith(this.getNamespace(outerName)) || this.getNamespace(outerName).startsWith(this.getNamespace(innerName))) return false;

        if (this.isCoreOp(outerName))
        {
            if (this.isExtensionOp(innerName)) return "(SubpatchOp) Core ops cannot contain extension ops.";
            if (this.isTeamOp(innerName)) return "(SubpatchOp) Core ops cannot contain team ops.";
            if (this.isUserOp(innerName)) return "(SubpatchOp) Core ops cannot contain user ops.";
            if (this.isPatchOp(innerName)) return "(SubpatchOp) Core ops cannot contain patch ops.";
        }
        else if (this.isExtensionOp(outerName))
        {
            if (this.isTeamOp(innerName)) return "(SubpatchOp) Extension ops cannot contain team ops.";
            if (this.isUserOp(innerName)) return "(SubpatchOp) Extension ops cannot contain user ops.";
            if (this.isPatchOp(innerName)) return "(SubpatchOp) Extension ops cannot contain patch ops.";
        }
        else if (this.isTeamOp(outerName))
        {
            if (this.isTeamOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "(SubpatchOp) Team ops cannot contain ops of other teams.";
            if (this.isUserOp(innerName)) return "(SubpatchOp) Team ops cannot contain user ops.";
            if (this.isPatchOp(innerName)) return "(SubpatchOp) Team ops cannot contain patch ops.";
        }
        else if (this.isUserOp(outerName))
        {
            if (this.isUserOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "(SubpatchOp) User ops cannot contain ops of other users.";
            if (this.isPatchOp(innerName)) return "(SubpatchOp) User ops cannot contain patch ops.";
        }
        else if (this.isPatchOp(outerName))
        {
            if (this.isPatchOp(innerName) && this.getNamespace(innerName) !== this.getNamespace(outerName)) return "(SubpatchOp) Patch ops cannot contain ops of other patches.";
        }

        return false;
    }

    opExists(opName, updateCache = true)
    {
        let p = this.getOpAbsoluteFileName(opName);
        let exists = false;
        try
        {
            if (!p || !fs.existsSync(p)) return false;
            p = fs.realpathSync.native(p);
            exists = p.includes(opName);
        }
        catch (e)
        {
            exists = false;
        }
        if (!exists && updateCache)
        {
            this._docsUtil.removeOpNameFromLookup(opName);
        }
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

    isOpId(id)
    {
        return uuidv4.isUUID(id);
    }

    isCoreOp(opName)
    {
        if (!opName) return false;
        return !(this.isUserOp(opName) || this.isTeamOp(opName) || this.isExtensionOp(opName) || this.isPatchOp(opName));
    }

    isUserOp(opName)
    {
        if (!opName) return false;
        return opName.startsWith(this.PREFIX_USEROPS);
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

    isStandaloneOp(opname)
    {
        if (!opname) return false;
        return opname.includes(this.INFIX_STANDALONEOPS);
    }

    isTeamOp(opname)
    {
        if (!opname) return false;
        return opname.startsWith(this.PREFIX_TEAMOPS);
    }

    isOpOfTeam(opName, team)
    {
        if (!opName) return false;
        if (!team) return false;
        const namespaces = [...team.namespaces, ...team.extensions];
        return namespaces.some((ns) => { return opName.startsWith(ns); });
    }

    isTeamOpOfTeam(opName, team)
    {
        if (!this.isTeamOp(opName)) return false;
        if (!team) return false;
        if (!team.namespaces || team.namespaces.length === 0) return false;
        const namespace = this.getFullTeamNamespaceName(opName);
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
        return this.isTeamNamespace(name) || this.isExtensionNamespace(name) || this.isPatchOpNamespace(name);
    }

    getCollectionDir(name, relative = false)
    {
        if (this.isExtensionNamespace(name)) return this.getExtensionDir(name, relative);
        if (this.isTeamNamespace(name)) return this.getTeamNamespaceDir(name, relative);
        if (this.isPatchOpNamespace(name)) return this.getPatchOpDir(name, relative);
        return null;
    }

    isUserOpNamespace(name)
    {
        if (!name) return false;
        return name.startsWith(this.PREFIX_USEROPS);
    }

    isCoreNamespace(namespace)
    {
        if (!namespace) return false;
        return !(this.isUserOpNamespace(namespace) || this.isTeamNamespace(namespace) || this.isExtensionNamespace(namespace) || this.isPatchOpNamespace(namespace));
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
        {
            const opDoc = opDocs[i];
            if (opDoc && opDoc.nameNoVersion === opnameWithoutVersion)
            {
                if (opDoc.version > theVersion) return true;
            }
        }

        return false;
    }

    getOpCode(opName)
    {
        const fn = this.getOpAbsoluteFileName(opName);
        try
        {
            if (fn && fs.existsSync(fn))
            {
                return fs.readFileSync(fn, "utf8");
            }
        }
        catch (e)
        {
            this._log.warn("op code file not found", opName);
            this._docsUtil.removeOpNameFromLookup(opName);
        }
        return null;
    }

    setOpDefaults(opname, author = null)
    {
        const fn = this.getOpJsonPath(opname);
        if (!fn)
        {
            this._log.error("op default error read", opname, "has no json path");
            return;
        }
        let obj = null;
        try
        {
            obj = jsonfile.readFileSync(fn);
        }
        catch (e)
        {
            this._log.error("op default error read", opname, fn, e);
            return;
        }
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

        if (!obj.hasOwnProperty("license"))
        {
            obj.license = defaults.license;
            hasChanged = true;
        }

        if (hasChanged)
        {
            jsonfile.writeFileSync(fn, obj, { "encoding": "utf-8", "spaces": 4 });
        }
        return hasChanged;
    }

    getOpDefaults(opName, author = null)
    {
        const defaults = {
            "id": uuidv4(),
            "created": Date.now(),
            "license": "MIT"
        };
        if (author) defaults.authorName = author.username;
        return defaults;
    }

    getNamespace(opname, topLevel = false)
    {
        if (!opname) return "";
        const parts = opname.split(".");
        if (topLevel)
        {
            parts.length = this.isCoreOp(opname) ? 2 : 3;
        }
        else
        {
            parts.length -= 1;
        }
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

    _getCLIConfig()
    {
        return {
            "fix": true,
            "baseConfig": {
                "extends": eslintAirbnbBase.extends,
            },
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

    getOpSourceDir(opName, relative = false)
    {
        if (opName.endsWith(".")) opName = opName.substring(0, opName.length - 1);
        if (this.isUserOp(opName))
        {
            let absolutePath = this._cables.getUserOpsPath();
            if (relative) absolutePath = this._cables.USER_OPS_SUBDIR;
            return path.join(absolutePath, opName, "/");
        }
        else if (this.isCollection(opName))
        {
            let absolutePath = this.getCollectionDir(opName, relative);
            return path.join(absolutePath, opName, "/");
        }
        else if (this.isPatchOp(opName))
        {
            let absolutePath = this.getPatchOpDir(opName, relative);
            if (relative) absolutePath = this._cables.PATCH_OPS_SUBDIR;
            return path.join(absolutePath, opName, "/");
        }
        else
        {
            let absolutePath = this._cables.getCoreOpsPath();
            if (relative) absolutePath = this._cables.CORE_OPS_SUBDIR;
            return path.join(absolutePath, opName, "/");
        }
    }

    getOpTargetDir(opName, relative = false)
    {
        return this.getOpSourceDir(opName, relative);
    }

    getTeamNamespaceDir(name, relative = false)
    {
        let teamNameSpace = this.getTeamNamespaceByOpName(name);
        if (!name || !teamNameSpace) return null;

        if (!teamNameSpace.startsWith(this.PREFIX_TEAMOPS))
        {
            // shortname given
            teamNameSpace = this.PREFIX_TEAMOPS + name;
        }
        if (teamNameSpace.endsWith(".")) teamNameSpace = teamNameSpace.substring(0, teamNameSpace.length - 1);
        let collectionPath = path.join(teamNameSpace, "/");
        if (!relative)
        {
            collectionPath = path.join(this._cables.getTeamOpsPath(), "/", teamNameSpace, "/");
        }
        else
        {
            collectionPath = path.join(this._cables.TEAM_OPS_SUBDIR, "/", teamNameSpace, "/");
        }
        return path.join(collectionPath, "/");
    }

    getExtensionDir(name, relative = false)
    {
        let extensionName = this.getExtensionNamespaceByOpName(name);
        if (extensionName.endsWith(".")) extensionName = extensionName.substring(0, extensionName.length - 1);
        let collectionPath = path.join(extensionName, "/");
        if (!relative)
        {
            collectionPath = path.join(this._cables.getExtensionOpsPath(), "/", extensionName, "/");
        }
        else
        {
            collectionPath = path.join(this._cables.EXTENSION_OPS_SUBDIR, "/", extensionName, "/");
        }
        return path.join(collectionPath, "/");
    }

    getPatchOpDir(name, relative = false)
    {
        const patchOpDir = name ? name.split(".", 3).join(".") : null;
        let collectionPath = path.join(patchOpDir, "/");
        if (!relative)
        {
            collectionPath = path.join(this._cables.getPatchOpsPath(), "/", patchOpDir, "/");
        }
        else
        {
            collectionPath = path.join(this._cables.PATCH_OPS_SUBDIR, "/", patchOpDir, "/");
        }
        return path.join(collectionPath, "/");
    }

    getCollectionJsonPath(name, create = true)
    {
        if (this.isTeamNamespace(name))
        {
            return this.getTeamNamespaceJsonPath(name, create);
        }
        else if (this.isExtensionNamespace(name))
        {
            return this.getExtensionJsonPath(name, create);
        }
        else
        {
            return null;
        }
    }

    getCollectionDocs(name)
    {
        const file = this.getCollectionJsonPath(name, false);
        let docs = {};
        if (file) docs = jsonfile.readFileSync(file);
        return docs;
    }

    getCollectionVisibility(name, defaultVisibility = this.VISIBILITY_PUBLIC)
    {
        let visibility = defaultVisibility;
        if (this.isCoreNamespace(name)) visibility = this.VISIBILITY_PUBLIC;

        const docs = this.getCollectionDocs(name);
        if (docs.hasOwnProperty("visibility")) visibility = docs.visibility;
        return visibility;
    }

    getTeamNamespaceJsonPath(name, create = true)
    {
        const dirName = this.getTeamNamespaceDir(name);
        let extName = this.getTeamNamespaceByOpName(name);
        if (extName.endsWith(".")) extName = extName.substring(0, extName.length - 1);
        const filename = path.join(dirName, extName + ".json");
        let existsFile = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && create)
        {
            mkdirp.sync(dirName);
            existsPath = fs.existsSync(dirName);
        }
        if (existsPath && !existsFile && create)
        {
            jsonfile.writeFileSync(filename, { "name": name }, { "encoding": "utf-8", "spaces": 4 });
            existsFile = true;
        }
        if (!existsPath || !existsFile) return null;
        return filename;
    }

    getExtensionJsonPath(name, create = true)
    {
        const dirName = this.getExtensionDir(name);
        let extName = this.getExtensionNamespaceByOpName(name);
        if (extName.endsWith(".")) extName = extName.substring(0, extName.length - 1);
        const filename = path.join(dirName, extName + ".json");
        let existsFile = fs.existsSync(filename);
        let existsPath = fs.existsSync(dirName);
        if (!existsPath && create)
        {
            mkdirp.sync(dirName);
            existsPath = fs.existsSync(dirName);
        }
        if (existsPath && !existsFile && create)
        {
            jsonfile.writeFileSync(filename, { "name": name }, { "encoding": "utf-8", "spaces": 4 });
            existsFile = true;
        }
        if (!existsPath || !existsFile) return null;
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
        if (this.isCoreOp(collectionName)) dir = this._cables.getCoreOpsPath();

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
        const opDir = this.getOpSourceDir(opName);
        if (!fs.existsSync(opDir))
        {
            mkdirp.sync(opDir);
        }
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

    addAttachment(opName, attName, content)
    {
        if (opName &&
            attName &&
            attName !== "null" &&
            attName.indexOf("att_") === 0)
        {
            let p = this.getOpAbsolutePath(opName);
            p = path.join(p, sanitizeFileName(attName));

            if (this.isCoreOp(opName))
            {
                if (p.endsWith(".js"))
                {
                    const format = this.validateAndFormatOpCode(content);
                    content = format.formatedCode;
                }
            }
            content = this._helperUtil.removeTrailingSpaces(content);
            fs.writeFileSync(p, content, "utf8");
            return p;
        }
        return null;
    }

    updateAttachment(opName, attName, content, force = false, res = false)
    {
        if (res) res.startTime("sanitizeFileName");
        let p = this.getOpAbsolutePath(opName);
        p = path.join(p, sanitizeFileName(attName));
        if (res) res.endTime("sanitizeFileName");

        if (this.isCoreOp(opName))
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
            p = path.join(p, sanitizeFileName(attName));
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

    getOpRenameProblems(newName, oldName, userObj, teams = [], newOpProject = null, oldOpProject = null, opUsages = [], checkUsages = true, targetDir = null)
    {
        const problems = {};
        if (!newName)
        {
            problems.no_name = "No op name.";
            newName = "";
        }

        const oldOpExists = this.opExists(oldName);
        if (oldName && !oldOpExists)
        {
            problems.source_does_not_exist = "Source op does not exist.";
            return problems;
        }


        const newNamespace = this.getNamespace(newName);
        const oldNamespace = this.getNamespace(oldName);
        if (!newNamespace || newNamespace === this.PREFIX_OPS) problems.namespace_empty = "Op namespace cannot be empty or only '" + this.PREFIX_OPS + "'.";
        if (newNamespace && newNamespace.startsWith("Ops.Patch.") && !this.isPatchOp(newName)) problems.patch_op_illegal_namespace = "Illegal patch op namespace: '" + newNamespace + "'.";

        if (newName.endsWith(".")) problems.name_ends_with_dot = "Op name cannot end with '.'";
        if (!newName.startsWith(this.PREFIX_OPS)) problems.name_not_op_namespace = "Op name does not start with '" + this.PREFIX_OPS + "'.";
        if (newName.startsWith(this.PREFIX_OPS + this.PREFIX_OPS)) problems.name_not_op_namespace = "Op name starts with '" + this.PREFIX_OPS + this.PREFIX_OPS + "'.";
        const opExists = this.opExists(newName);
        if (opExists) problems.target_exists = "Op exists already.";
        if (!opExists && this.opNameTaken(newName)) problems.name_taken = "Op with same name (ignoring case) exists already.";
        if (newName.length < this.OP_NAME_MIN_LENGTH) problems.name_too_short = "Op name too short (min. " + this.OP_NAME_MIN_LENGTH + " characters).";
        if (newName.indexOf("..") !== -1) problems.name_contains_doubledot = "Op name contains '..'.";
        let matchString = "[^abcdefghijklmnopqrstuvwxyz._ABCDEFGHIJKLMNOPQRSTUVWXYZ0-9";
        // patchops can have - because they contain the patch shortid
        if (this.isPatchOp(newName) || this.isTeamOp(newName))
        {
            const shortName = this.getOpShortName(newName);
            if (shortName.includes("-")) problems.name_contains_illegal_characters = "Op name contains illegal characters.";
            matchString += "\\-";
        }
        matchString += "]";
        if (this.isPatchOp(oldName) && this.isPatchOp(newName) && (oldNamespace !== newNamespace))
        {
            problems.patch_op_rename_illegal = "Patch ops cannot be renamed to another patch, use copypaste to use the op in other patches";
        }

        if (newName.match(matchString)) problems.name_contains_illegal_characters = "Op name contains illegal characters.";

        const versionParts = newName.toLowerCase().split(this.SUFFIX_VERSION);
        if (versionParts.length > 2) problems.name_contains_illegal_characters = "Op name cannot contain version suffix `_v` more than once.";
        versionParts.shift();
        versionParts.forEach((versionPart) =>
        {
            if (!this._helperUtil.isNumeric(versionPart))
            {
                problems.name_contains_illegal_characters = "Version suffix `_v` can only be followed by numbers. ";
            }
        });

        const parts = newName.split(".");
        for (let i = 0; i < parts.length; i++) // do not start
        {
            if (parts[i].length > 0)
            {
                const firstChar = parts[i].charAt(0);
                const isnum = this._helperUtil.isNumeric(firstChar);
                if (isnum) problems.namespace_starts_with_numbers = "Op namespace parts cannot start with numbers (" + parts[i] + ").";
                if (firstChar === " ") problems.namespace_starts_with_whitespace = "Op namespace cannot start with whitespace (" + parts[i] + ").";
                if (firstChar === "-") problems.namespace_starts_with_dash = "Op namespace parts can not start with - (" + parts[i] + ").";
                if (parts[i].charAt(0) !== parts[i].charAt(0).toUpperCase())
                {
                    if (!this.isUserOp(newName) || i > 2)
                    {
                        problems.namespace_not_uppercase = "All namespace parts have to be uppercase (" + parts[i] + ").";
                    }
                }
            }
        }

        if (Object.keys(problems).length === 0)
        {
            if (!this.userHasWriteRightsOp(userObj, newName, teams, newOpProject))
            {
                problems.no_rights_target = "You lack permissions to " + newName + ".";
            }

            if (oldName)
            {
                if (!this.userHasWriteRightsOp(userObj, oldName, teams, oldOpProject)) problems.no_rights_source = "You lack permissions to " + oldName + ".";
                if (!oldOpExists) problems.not_found_source = oldName + " does not exist.";
            }
        }
        if (opUsages && checkUsages)
        {
            opUsages.forEach((opReference) =>
            {
                const refName = this.getOpNameById(opReference.referenceId);
                if (refName)
                {
                    const hierarchyProblem = this.getNamespaceHierarchyProblem(refName, newName);
                    if (hierarchyProblem)
                    {
                        const refLink = "[" + refName + "](" + refName + ")";
                        const oldLink = "[" + oldName + "](" + oldName + ")";
                        problems.op_used_elsewhere = refLink + " contains " + oldLink + ", and cannot be renamed, try cloning the op instead.";
                    }
                }
            });
        }
        const subPatchAtt = this.getSubPatchOpAttachment(oldName);
        if (subPatchAtt)
        {
            subPatchAtt.ops.forEach((subPatchOp) =>
            {
                const subPatchOpName = this.getOpNameById(subPatchOp.opId);
                const hierarchyProblem = this.getNamespaceHierarchyProblem(newName, subPatchOpName);
                if (hierarchyProblem)
                {
                    problems.bad_op_hierarchy = hierarchyProblem;
                }
            });
        }
        return problems;
    }

    getOpShortName(opName)
    {
        if (!opName) return "";
        const parts = opName.split(".");
        return parts.pop();
    }

    getOpRenameConsequences(newName, oldName)
    {
        const consequences = {};
        if (this.isUserOp(newName))
        {
            consequences.will_be_userop = "Your new op will be available only to you in all your patches.";
            consequences.edit_only_user = "Only you will be able to make changes to your new op.";
        }
        else if (this.isTeamOp(newName))
        {
            consequences.will_be_teamop = "Your new op will be available only by members of the owning team.";
            consequences.edit_only_team = "Team members with full-access rights will be able to make changes to your new op.";
            consequences.no_public_patches = "You will NOT be able to publish patches using this op in private or unlisted teams.";
        }
        else if (this.isExtensionOp(newName))
        {
            consequences.will_be_extensionop = "Your new op will be available to all users.";
            consequences.read_only = "Team members with full-access rights will be able to make changes to your new op.";
        }
        else if (this.isPatchOp(newName))
        {
            consequences.will_be_patchop = "Your new op will be available only in the current patch.";
            consequences.edit_only_collaborators = "People with access to the patch will be able to see, edit and copy it.";
        }
        else
        {
            consequences.will_be_extensionop = "Your new op will be available to all users of cables.";
            consequences.edit_only_staff = "Only cables-staff will be able to make changes to this op.";
        }
        if (this.isDevOp(newName))
        {
            consequences.will_be_devop = "You new op will be available ONLY on dev.cables.gl.";
        }
        return consequences;
    }

    namespaceExists(namespaceName, opDocs = null)
    {
        if (!namespaceName) return false;
        if (!opDocs) opDocs = this._docsUtil.getOpDocs();
        let exists = this.namespaceExistsInCore(namespaceName, opDocs);
        if (exists) return true;
        const nameLookup = this._docsUtil.getCachedOpLookup();
        if (nameLookup && nameLookup.names)
        {
            let nsName = namespaceName.toLowerCase();
            if (Object.keys(nameLookup.names).find((name) => { return name.toLowerCase().startsWith(nsName); })) return true;
        }
        const namespaceDir = this.getCollectionDir(namespaceName);
        if (namespaceDir && fs.existsSync(namespaceDir)) return true;
        return false;
    }

    getNextVersionOpName(opName, opDocs)
    {
        const highestVersion = this.getHighestVersionOpName(opName, opDocs);
        let version = this.getVersionFromOpName(highestVersion);

        const noVersionName = this.getOpNameWithoutVersion(opName);

        let nextName = "";
        if (!this.opExists(noVersionName))
        {
            nextName = noVersionName;
        }
        else if (version === 0)
        {
            nextName = noVersionName + this.SUFFIX_VERSION + 2;
        }
        else
        {
            version++;
            nextName = noVersionName + this.SUFFIX_VERSION + version;
        }
        return nextName;
    }

    updateCoreLibs(opName, libNames)
    {
        const filename = this.getOpJsonPath(opName);
        const obj = jsonfile.readFileSync(filename);
        obj.coreLibs = libNames || [];
        jsonfile.writeFileSync(filename, obj, { "encoding": "utf-8", "spaces": 4 });
        return obj.coreLibs;
    }

    updateAttachments(opName, attachments)
    {
        let problems = null;
        const update = Object.keys(attachments);
        for (let i = 0; i < update.length; i++)
        {
            const attName = update[i];
            if (attName && attName !== "null" && attName.indexOf("att_") === 0)
            {
                let content = attachments[attName];
                problems = this.updateAttachment(opName, attName, content);
                if (problems) break;
            }
        }
        return problems;
    }

    getAttachments(opName)
    {
        const attachments = {};
        const attachmentFiles = this.getAttachmentFiles(opName);
        const dirName = this.getOpAbsolutePath(opName);
        attachmentFiles.forEach((file) =>
        {
            const filename = path.join(dirName, file);
            attachments[file] = fs.readFileSync(filename, { "encoding": "utf8" });
        });
        return attachments;
    }

    cloneOp(oldName, newName, user, targetDir = null)
    {
        const code = fs.readFileSync(this.getOpAbsoluteFileName(oldName), "utf8");
        let fn = this.getOpAbsoluteFileName(newName);
        let basePath = this.getOpAbsolutePath(newName);
        const oldPath = this.getOpAbsolutePath(oldName);


        let newJsonFile;
        if (targetDir)
        {
            basePath = targetDir;
            let opPath = path.join(basePath, this.getOpTargetDir(newName, true));
            mkdirp.sync(opPath);
            fn = path.join(opPath, this.getOpFileName(newName));
            newJsonFile = path.join(opPath, this.getOpJsonFilename(newName));
        }
        else
        {
            newJsonFile = this.getOpJsonPath(newName, true);
        }

        mkdirp.sync(basePath);
        fs.writeFileSync(fn, code);

        let newJson = {
            "id": uuidv4(),
            "authorName": user.username,
            "created": Date.now()
        };
        const oldJsonFile = this.getOpJsonPath(oldName);
        if (oldJsonFile)
        {
            const oldJson = JSON.parse(fs.readFileSync(oldJsonFile));
            newJson = Object.assign(oldJson, newJson);
        }

        if (!Array.isArray(newJson.changelog)) newJson.changelog = [];
        if (newJson.hasOwnProperty("exampleProjectId")) delete newJson.exampleProjectId;
        if (newJson.hasOwnProperty("youtubeid")) delete newJson.youtubeid;
        if (newJson.hasOwnProperty("youtubeids")) delete newJson.youtubeids;

        if (this.getOpNameWithoutVersion(oldName) !== this.getOpNameWithoutVersion(newName))
        {
            const change = {
                "message": "op created",
                "type": "new op",
                "author": user.username,
                "date": Date.now()
            };
            newJson.changelog.push(change);
        }

        jsonfile.writeFileSync(newJsonFile, newJson, {
            "encoding": "utf-8",
            "spaces": 4
        });

        const opId = newJson.id;

        const attachmentFiles = this.getAttachmentFiles(oldName);
        const attachments = {};
        for (let i = 0; i < attachmentFiles.length; i++)
        {
            const attachmentFile = attachmentFiles[i];
            fs.copySync(oldPath + attachmentFile, basePath + attachmentFile);
            attachments[attachmentFile] = this.getAttachment(newName, attachmentFile);
        }

        const docsMd = this._docsUtil.getOpDocMd(oldName);
        if (docsMd)
        {
            const filenameMd = basePath + "/" + newName + ".md";
            fs.writeFileSync(filenameMd, docsMd);
        }
        this._docsUtil.updateOpDocs(newName);
        this._docsUtil.addOpToLookup(opId, newName);

        return {
            "name": newName,
            "id": opId,
            "opDoc": newJson,
            "code": code,
            "attachments": attachments
        };
    }

    renameToCoreOp(oldName, newName, currentUser, removeOld, cb = null)
    {
        let oldOpDir = this.getOpSourceDir(oldName);
        let newOpDir = this.getOpTargetDir(newName);
        return this._renameOp(oldName, newName, currentUser, true, removeOld, false, oldOpDir, newOpDir, cb);
    }

    renameToExtensionOp(oldName, newName, currentUser, removeOld, cb = null)
    {
        let oldOpDir = this.getOpSourceDir(oldName);
        let newOpDir = this.getOpTargetDir(newName);
        return this._renameOp(oldName, newName, currentUser, true, removeOld, false, oldOpDir, newOpDir, cb);
    }

    renameToTeamOp(oldName, newName, currentUser, removeOld, cb = null)
    {
        let oldOpDir = this.getOpSourceDir(oldName);
        let newOpDir = this.getOpTargetDir(newName);
        return this._renameOp(oldName, newName, currentUser, false, removeOld, false, oldOpDir, newOpDir, cb);
    }

    renameToUserOp(oldName, newName, currentUser, removeOld, cb = null)
    {
        let oldOpDir = this.getOpSourceDir(oldName);
        let newOpDir = this.getOpTargetDir(newName);
        return this._renameOp(oldName, newName, currentUser, false, removeOld, false, oldOpDir, newOpDir, cb);
    }

    renameToPatchOp(oldName, newName, currentUser, removeOld, newId, cb = null)
    {
        let oldOpDir = this.getOpSourceDir(oldName);
        let newOpDir = this.getOpTargetDir(newName);
        return this._renameOp(oldName, newName, currentUser, false, removeOld, newId, oldOpDir, newOpDir, cb);
    }

    updateOp(user, opName, updates, options = {})
    {
        const opExists = this.opExists(opName);
        let rebuildOpDocs = !opExists;
        if (updates)
        {
            const result = {};
            const keys = Object.keys(updates);
            if (keys.length > 0)
            {
                const jsonFile = this.getOpJsonPath(opName, !opExists);
                let attProblems = null;
                for (let i = 0; i < keys.length; i++)
                {
                    const key = keys[i];
                    if (key !== null && key !== undefined)
                    {
                        switch (key)
                        {
                        case "code":
                            let code = updates.code;
                            const format = this.validateAndFormatOpCode(code);
                            if (format.error)
                            {
                                const {
                                    line,
                                    message
                                } = format.message;
                                this._log.info({
                                    line,
                                    message
                                });
                                return;
                            }

                            const formatedCode = format.formatedCode;
                            if (options.formatCode || this.isCoreOp(opName))
                            {
                                code = formatedCode;
                            }
                            result.code = this.updateOpCode(opName, user, updates.code);
                            rebuildOpDocs = true;
                            break;
                        case "layout":
                            const obj = jsonfile.readFileSync(jsonFile);
                            obj.layout = updates.layout;
                            if (obj.layout && obj.layout.name) delete obj.layout.name;
                            jsonfile.writeFileSync(jsonFile, obj, {
                                "encoding": "utf-8",
                                "spaces": 4
                            });
                            result.layout = obj.layout;
                            rebuildOpDocs = true;
                            break;
                        case "attachments":
                            result.attachments = {};
                            attProblems = this.updateAttachments(opName, updates.attachments);
                            result.attachments = this.getAttachments(opName);
                            break;
                        case "libs":
                            result.libs = [];
                            const newLibNames = updates.libs;
                            this.updateLibs(opName, newLibNames);
                            result.libs = this.getOpLibs(opName);
                            rebuildOpDocs = true;
                            break;
                        case "coreLibs":
                            result.coreLibs = [];
                            const newCoreLibNames = updates.coreLibs;
                            this.updateCoreLibs(opName, newCoreLibNames);
                            result.coreLibs = this.getOpCoreLibs(opName);
                            rebuildOpDocs = true;
                            break;
                        }
                    }
                }
                if (rebuildOpDocs)
                {
                    this._docsUtil.updateOpDocs(opName);
                }

                if (!attProblems)
                {
                    return { "data": result };
                }
                else
                {
                    return attProblems;
                }
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }

    saveLayout(opName, layout)
    {
        const filename = this.getOpJsonPath(opName);

        try
        {
            const obj = jsonfile.readFileSync(filename);

            obj.layout = layout;
            if (obj.layout && obj.layout.name) delete obj.layout.name;

            try
            {
                jsonfile.writeFileSync(filename, obj, { "encoding": "utf-8", "spaces": 4 });
                return true;
            }
            catch (_err)
            {
                return false;
            }
        }
        catch (err)
        {
            return false;
        }
    }

    createOp(opName, author, code = null, opDocDefaults = null, attachments = null, targetDir = null)
    {
        if (!opDocDefaults) opDocDefaults = {};
        let parts = opName.split(".");
        if (parts[0] === "Ops" && parts[1] === "User")
        {
            parts[2] = author.usernameLowercase;
        }
        opName = parts.join(".");

        const result = {};
        let fn = this.getOpAbsoluteFileName(opName);
        if (!fn)
        {
            return { "problems": ["invalid op name" + opName] };
        }
        let basePath = this.getOpTargetDir(opName);
        let jsonPath = this.getOpJsonPath(opName, !targetDir);

        if (targetDir)
        {
            basePath = targetDir;
            let opPath = path.join(basePath, this.getOpTargetDir(opName, true));
            mkdirp.sync(opPath);
            fn = path.join(opPath, this.getOpFileName(opName));
            jsonPath = path.join(opPath, this.getOpJsonFilename(opName));
        }
        mkdirp.sync(basePath);

        const opDefaults = this.getOpDefaults(opName, author);
        let newJson = opDefaults;
        if (opDocDefaults)
        {
            delete opDocDefaults.id;
            newJson = { ...opDefaults, ...opDocDefaults };
        }

        const opId = newJson.id;
        code = code ||
            ""
            + "// welcome to your new op!\n"
            + "// have a look at the documentation:\n"
            + "// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops\n"
            + "\n"
            + "const\n"
            + "    exec = op.inTrigger(\"Trigger\"),\n"
            + "    myNumber = op.inFloat(\"Number\"),\n"
            + "    next = op.outTrigger(\"Next\"),\n"
            + "    result = op.outNumber(\"Result\");\n"
            + "\n"
            + "exec.onTriggered = () =>\n"
            + "{\n"
            + "    result.set(myNumber.get() * 100);\n"
            + "};\n";
        fs.writeFileSync(fn, code);

        if (opDocDefaults.layout)
        {
            const obj = newJson;
            obj.layout = opDocDefaults.layout;
            if (obj.layout && obj.layout.name) delete obj.layout.name;
            result.layout = obj.layout;
        }

        if (opDocDefaults.libs)
        {
            const newLibNames = opDocDefaults.libs;
            newJson.libs = newLibNames;
            result.libs = newLibNames;
        }

        if (opDocDefaults.coreLibs)
        {
            result.coreLibs = [];
            const newCoreLibNames = opDocDefaults.coreLibs;
            newJson.coreLibs = newCoreLibNames;
            result.coreLibs = newCoreLibNames;
        }

        jsonfile.writeFileSync(jsonPath, newJson, {
            "encoding": "utf-8",
            "spaces": 4
        });

        let attProblems = null;
        if (attachments)
        {
            result.attachments = {};
            attProblems = this.updateAttachments(opName, attachments);
            result.attachments = this.getAttachments(opName);
        }

        this.addOpChangelog(author, opName, { "message": "op created", "type": "new op" });
        this._docsUtil.updateOpDocs(opName);
        this._docsUtil.addOpToLookup(opId, opName);

        const response = {
            "name": opName,
            "id": opId,
            "code": code,
            "opDoc": newJson
        };
        if (!attProblems)
        {
            if (result.attachments)
            {
                const attachmentFiles = this.getAttachmentFiles(opName);
                const atts = {};
                for (let i = 0; i < attachmentFiles.length; i++)
                {
                    const attachmentFile = attachmentFiles[i];
                    atts[attachmentFile] = this.getAttachment(opName, attachmentFile);
                }
                response.attachments = atts;
            }
            if (result.coreLibs) response.coreLibs = result.coreLibs;
            if (result.libs) response.libs = result.libs;
        }
        else
        {
            response.problems = attProblems;
        }
        return response;
    }

    getOpAssetPorts(op, includeLibraryAssets = false)
    {
        const assetPorts = [];
        if (!op) return assetPorts;
        if (!op.portsIn) return assetPorts;

        for (let i = 0; i < op.portsIn.length; i++)
        {
            const port = op.portsIn[i];
            if (
                port.value &&
                typeof port.value == "string" &&
                port.name &&
                port.value.length &&
                (port.display === "file" ||
                    port.name.toLowerCase().includes("file") ||
                    port.name.toLowerCase().includes("url") ||
                    // port names in cubemapfromtextures !
                    port.name.toLowerCase().includes("posx") ||
                    port.name.toLowerCase().includes("posy") ||
                    port.name.toLowerCase().includes("posz") ||
                    port.name.toLowerCase().includes("negx") ||
                    port.name.toLowerCase().includes("negy") ||
                    port.name.toLowerCase().includes("negz")) &&
                port.value.toLowerCase().includes("assets/")
            )
            {
                if (!port.value.toLowerCase().includes("assets/library"))
                {
                    assetPorts.push(port);
                }
                else if (includeLibraryAssets)
                {
                    assetPorts.push(port);
                }
            }
        }
        return assetPorts;
    }

    getOpNameByAbsoluteFileName(fileName)
    {
        if (!fileName) return "";
        const parts = path.parse(fileName);
        if (parts && parts.name) return parts.name;
        return "";
    }

    _minifyGlsl(glsl)
    {
        if (!glsl) return "";

        const tokens = tokenString(glsl);
        let str = "";
        for (let i = 0; i < tokens.length - 1; i++)
        {
            const token = tokens[i];

            if (i > 0)
            {
                if (token.type == "line-comment") continue;
                if (token.type == "block-comment") continue;

                if (token.type == "whitespace" && token.data == "\n" && tokens[i - 1].type == "line-comment") continue;

                if (token.type == "whitespace")
                {
                    if (token.data.indexOf("\n") == 0 && token.data.endsWith(" ")) token.data = "\n";

                    for (let j = 0; j < 3; j++)
                        token.data = token.data.replaceAll("\n\n", "\n");

                    token.data = token.data.replaceAll("\t", " ");

                    for (let j = 0; j < 3; j++)
                        token.data = token.data.replaceAll("  ", " ");

                    for (let j = 0; j < 2; j++)
                        token.data = token.data.replaceAll("\n\n", "\n");
                }

                if (token.type == "float")
                    while (token.data.indexOf(".") > 0 && token.data.endsWith("0"))
                        token.data = token.data.substring(0, token.data.length - 1);

                if (token.type == "whitespace" && token.data == " ")
                {
                    if (tokens[i - 1].type == "ident" && tokens[i + 1].type == "ident") continue;
                    if (tokens[i - 1].type == "ident" && tokens[i + 1].type == "operator") continue;
                    if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "ident") continue;
                    if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "float") continue;
                    if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "keyword") continue;
                    if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "operator") continue;
                    if (tokens[i + 1].type != "ident" && tokens[i + 1].type != "keyword" && tokens[i - 1].type != "ident" && tokens[i - 1].type != "keyword") continue;
                }
            }

            str += token.data;
        }

        return str;
    }

    getOpSVG(opName, backgroundOptions)
    {
        const opDoc = this._docsUtil.getOpDocsFromFile(opName);

        if (!opDoc)
        {
            return this._getErrorSvg(opName, "unknown filename", backgroundOptions);
        }

        const xw = new XMLWriter();
        const height = 40;
        let width = 200;

        xw.startDocument();
        xw.startElement("svg");

        if (opDoc.layout)
        {
            if (opDoc.layout.portsIn) width = Math.max(width, opDoc.layout.portsIn.length * 14);
            if (opDoc.layout.portsOut) width = Math.max(width, opDoc.layout.portsOut.length * 14);
            if (backgroundOptions && backgroundOptions.imageWidth && backgroundOptions.imageWidth < width) backgroundOptions.imageWidth = width + (backgroundOptions.paddingLeft * 2);
        }

        xw.writeAttribute("xmlns", "http://www.w3.org/2000/svg");
        xw.writeAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        xw.writeAttribute("version", "1.1");

        if (backgroundOptions)
        {
            const viewboxWidth = backgroundOptions.imageWidth || width + (backgroundOptions.paddingLeft * 2);
            const viewboxHeight = backgroundOptions.imageHeight || height + (backgroundOptions.paddingTop * 2);
            xw.writeAttribute("x", "0px");
            xw.writeAttribute("y", "0px");
            xw.writeAttribute("viewBox", "0 0 " + viewboxWidth + " " + viewboxHeight);

            xw.startElement("rect");
            xw.writeAttribute("width", "100%");
            xw.writeAttribute("height", "100%");
            xw.writeAttribute("fill", backgroundOptions.color);
            xw.endElement();

            xw.startElement("g");
            xw.writeAttribute("transform", "translate(" + backgroundOptions.paddingLeft + "," + backgroundOptions.paddingTop + ")");
        }
        else
        {
            xw.writeAttribute("width", width);
            xw.writeAttribute("height", "40");
        }


        const bgColor = "#333";

        xw.startElement("rect");
        xw.writeAttribute("width", width);
        xw.writeAttribute("height", height);
        xw.writeAttribute("fill", bgColor);

        if (opDoc.coreLibs && opDoc.coreLibs.indexOf("subpatchop") > -1)
        {
            xw.writeAttribute("stroke", "#555");
            xw.writeAttribute("stroke-width", "5");
        }

        xw.endElement();

        if (opDoc.layout)
        {
            if (opDoc.layout.portsIn)
            {
                for (let i = 0; i < opDoc.layout.portsIn.length; i++)
                {
                    xw.startElement("rect");
                    xw.writeAttribute("x", i * 14);
                    xw.writeAttribute("width", "11");
                    xw.writeAttribute("height", "6");
                    xw.writeAttribute("fill", this.opGetPortColor(opDoc.layout.portsIn[i].type));
                    xw.endElement();
                }

                for (let i = 0; i < opDoc.layout.portsIn.length; i++)
                    if (opDoc.layout.portsIn[i].longPort)
                    {
                        xw.startElement("rect");
                        xw.writeAttribute("x", i * 14 + 14 - 3);
                        xw.writeAttribute("width", (opDoc.layout.portsIn[i].longPort - 1) * (11 + 3));
                        xw.writeAttribute("height", "6");
                        xw.writeAttribute("opacity", 0.7);
                        xw.writeAttribute("fill", bgColor);
                        xw.endElement();

                        xw.startElement("rect");
                        xw.writeAttribute("x", i * 14 + 14 - 3);
                        xw.writeAttribute("width", (opDoc.layout.portsIn[i].longPort - 1) * (11 + 3));
                        xw.writeAttribute("opacity", 0.5);
                        xw.writeAttribute("height", "6");
                        xw.writeAttribute("fill", this.opGetPortColor(opDoc.layout.portsIn[i].type));
                        xw.endElement();
                    }
            }

            if (opDoc.layout.portsOut)
            {
                for (let i = 0; i < opDoc.layout.portsOut.length; i++)
                {
                    xw.startElement("rect");
                    xw.writeAttribute("x", i * 14);
                    xw.writeAttribute("y", height - 6);
                    xw.writeAttribute("width", "11");
                    xw.writeAttribute("height", "6");
                    xw.writeAttribute("fill", this.opGetPortColor(opDoc.layout.portsOut[i].type));
                    xw.endElement();
                }

                for (let i = 0; i < opDoc.layout.portsOut.length; i++)
                    if (opDoc.layout.portsOut[i].longPort)
                    {
                        xw.startElement("rect");
                        xw.writeAttribute("y", height - 6);
                        xw.writeAttribute("x", i * 14 + 14 - 3);
                        xw.writeAttribute("width", (opDoc.layout.portsOut[i].longPort - 1) * (11 + 3));
                        xw.writeAttribute("height", "6");
                        xw.writeAttribute("opacity", 0.7);
                        xw.writeAttribute("fill", bgColor);
                        xw.endElement();

                        xw.startElement("rect");
                        xw.writeAttribute("y", height - 6);
                        xw.writeAttribute("x", i * 14 + 14 - 3);
                        xw.writeAttribute("width", (opDoc.layout.portsOut[i].longPort - 1) * (11 + 3));
                        xw.writeAttribute("opacity", 0.5);
                        xw.writeAttribute("height", "6");
                        xw.writeAttribute("fill", this.opGetPortColor(opDoc.layout.portsOut[i].type));
                        xw.endElement();
                    }
            }
        }

        const shortName = this.getOpShortName(opName);

        xw.startElement("text");
        xw.writeAttribute("x", 8);
        xw.writeAttribute("y", 25);
        xw.writeAttribute("style", "font-family:SourceSansPro, arial;font-size:14px;");
        xw.writeAttribute("fill", this.opGetNamespaceColor(opName));
        xw.text(this.getOpNameWithoutVersion(shortName));
        xw.endElement();

        if (backgroundOptions) xw.endElement(); // end "g" when drawing background
        xw.endDocument();

        return xw.toString();
    }

    opGetPortColor(type)
    {
        if (!this._helperUtil.isNumeric(type)) return "#F00";
        type = Number(type);
        if (type === 0) return "#5CB59E";
        if (type === 1) return "#F0D165";
        if (type === 2) return "#AB5A94";
        if (type === 3) return "#8084D4";
        if (type === 4) return "#ffffff";
        if (type === 5) return "#d57272";
        return "#F00";
    }

    opGetNamespaceColor(ns)
    {
        if (!ns) return "#8084d4";

        if (ns.startsWith("Ops.Array")) return "#666aaa";
        if (
            ns.startsWith("Ops.String") ||
            ns.startsWith("Ops.Website")) return "#d57272";

        if (ns.startsWith("Ops.Sidebar") ||
            ns.startsWith("Ops.Json") ||
            ns.startsWith("Ops.Net") ||
            ns.startsWith("Ops.Webaudio") ||
            ns.startsWith("Ops.Html")) return "#9e5289";


        if (ns.startsWith("Ops.Gl") ||
            ns.startsWith("Ops.Trigger") ||
            ns.startsWith("Ops.Graphics")) return "#f0d165";

        if (ns.startsWith("Ops.Math") ||
            ns.startsWith("Ops.Boolean") ||
            ns.startsWith("Ops.Date") ||
            ns.startsWith("Ops.Color") ||
            ns.startsWith("Ops.Time") ||
            ns.startsWith("Ops.Anim") ||
            ns.startsWith("Ops.Number")) return "#4a917e";

        if (ns.startsWith(this.PREFIX_USEROPS)) return "#ffffff";
        return "#e7e7e7";
    }

    getPortTypeString(type)
    {
        if (!this._helperUtil.isNumeric(type)) return "Unknown";
        type = Number(type);
        if (type === 0) return "Number";
        else if (type === 1) return "Trigger";
        else if (type === 2) return "Object";
        else if (type === 4) return "Dynamic";
        else if (type === 5) return "String";
        else if (type === 3) return "Array";
        else return "Unknown";
    }

    _getErrorSvg(opName, err, backgroundOptions)
    {
        const xw = new XMLWriter();
        xw.startDocument();
        xw.startElement("svg");

        const width = 200;
        const height = 40;

        if (opName)
        {
            const parts = opName.split(".");
            opName = parts[parts.length - 1];
        }

        xw.writeAttribute("xmlns", "http://www.w3.org/2000/svg");
        xw.writeAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        xw.writeAttribute("version", "1.1");

        if (backgroundOptions)
        {
            const viewboxWidth = backgroundOptions.imageWidth || width + (backgroundOptions.paddingLeft * 2);
            const viewboxHeight = backgroundOptions.imageHeight || height + (backgroundOptions.paddingTop * 2);
            xw.writeAttribute("x", "0px");
            xw.writeAttribute("y", "0px");
            xw.writeAttribute("viewBox", "0 0 " + viewboxWidth + " " + viewboxHeight);

            xw.startElement("rect");
            xw.writeAttribute("width", "100%");
            xw.writeAttribute("height", "100%");
            xw.writeAttribute("fill", backgroundOptions.color);
            xw.endElement();

            xw.startElement("g");
            xw.writeAttribute("transform", "translate(" + backgroundOptions.paddingLeft + "," + backgroundOptions.paddingTop + ")");
        }
        else
        {
            xw.writeAttribute("width", width);
            xw.writeAttribute("height", height);
        }


        xw.startElement("rect");
        xw.writeAttribute("width", width);
        xw.writeAttribute("height", height);
        xw.writeAttribute("fill", "#333");
        xw.endElement();

        xw.startElement("text");
        xw.writeAttribute("x", 8);
        xw.writeAttribute("y", 26);
        xw.writeAttribute("style", "font-family:SourceSansPro, arial;font-size:18px;");
        xw.writeAttribute("fill", "#ffffff");
        xw.text(this.getOpNameWithoutVersion(opName));
        xw.endElement();

        if (backgroundOptions) xw.endElement(); // end "g" when adding background
        xw.endDocument();

        return xw.toString();
    }

    _renameOp(oldName, newName, currentUser, formatCode, removeOld, newId, oldOpDir, newOpDir, cb = null)
    {
        if (!this.isPatchOp(newName))
        {
            this._log.verbose("STARTING RENAME");
            this._log.info("*" + currentUser.username + "* renaming " + oldName + " to " + newName);
        }

        let log = [];

        const oldOpFile = path.join(oldOpDir, oldName + ".js");
        const newOpFile = path.join(newOpDir, newName + ".js");

        let actionString = "moving";
        if (!removeOld) actionString = "copying";
        if (!this.isPatchOp(newName)) this._log.info("*" + currentUser.username + "* " + actionString + " " + oldOpFile + " to " + newOpFile);

        const exists = fs.existsSync(oldOpFile);
        const existsNew = fs.existsSync(newOpFile);

        if (!this.isPatchOp(newName)) this._log.verbose(oldOpFile);
        if (!this.isPatchOp(newName)) this._log.verbose("old exists", exists, "new exists", existsNew);

        if (existsNew)
        {
            log.push("ERROR: new op already exists!");
            if (cb) cb("OP_ALREADY_EXISTS", log);
            return false;
        }

        if (!exists)
        {
            log.push("ERROR: old op does not exist!");
            if (cb) cb("OP_DOES_NOT_EXIST", log);
            return false;
        }

        if (formatCode)
        {
            const code = fs.readFileSync(oldOpFile, "utf8");
            const format = this.validateAndFormatOpCode(code);
            if (format.error)
            {
                log.push("ERROR: failed to format opcode when moving to base-op!");
                if (cb) cb("OP_FORMAT_FAILED", log);
                return false;
            }
            else
            {
                fs.writeFileSync(oldOpFile, format.formatedCode);
            }

            const opFiles = fs.readdirSync(oldOpDir);
            for (let i = 0; i < opFiles.length; i++)
            {
                const opFile = opFiles[i];
                if (!opFile.startsWith("att_")) continue;
                if (!opFile.endsWith(".js")) continue;
                const attFile = path.join(oldOpDir, opFile);
                const attCode = fs.readFileSync(attFile, "utf8");
                const attFormat = this.validateAndFormatOpCode(attCode);
                if (attFormat.error)
                {
                    log.push("ERROR: failed to format attachment code: " + opFile);
                    if (cb) cb("ATT_FORMAT_FAILED", log);
                    return false;
                }
                else
                {
                    fs.writeFileSync(attFile, attFormat.formatedCode);
                }
            }
        }

        mkdirp.sync(newOpDir);
        fs.copySync(oldOpDir, newOpDir);

        if (!this.isPatchOp(newName)) this._log.verbose("newpath", newOpDir);
        if (!this.isPatchOp(newName)) this._log.verbose("oldpath", oldOpDir);

        fs.renameSync(path.join(newOpDir, oldName + ".js"), newOpFile);

        const oldMd = path.join(oldOpDir, oldName + ".md");
        const newMd = path.join(newOpDir, newName + ".md");
        if (fs.existsSync(oldMd))
        {
            fs.renameSync(path.join(newOpDir, oldName + ".md"), newMd);
        }

        const oldJson = path.join(oldOpDir, oldName + ".json");
        const newJson = path.join(newOpDir, newName + ".json");
        if (fs.existsSync(oldJson))
        {
            fs.renameSync(path.join(newOpDir, oldName + ".json"), newJson);
        }

        let jsonChange = false;
        const newJsonData = jsonfile.readFileSync(newJson);

        if (removeOld)
        {
            fs.emptyDirSync(oldOpDir);
            this._docsUtil.replaceOpNameInLookup(oldName, newName);
            fs.rmSync(oldOpDir, { "recursive": true });
        }

        if (!removeOld || newId)
        {
            if (newJsonData)
            {
                newJsonData.id = uuidv4();
                this._docsUtil.addOpToLookup(newJsonData.id, newName);
                jsonChange = true;
            }
        }

        const oldNameChangelog = oldName.replace(this.PREFIX_OPS, "");
        if (jsonChange) jsonfile.writeFileSync(newJson, newJsonData, { "encoding": "utf-8", "spaces": 4 });
        if (newName.includes(this.INFIX_DEPRECATED))
        {
            this.addOpChangelog(currentUser, newName, { "type": "deprecation", "message": "op " + oldNameChangelog + " was deprecated" });
        }
        else
        {
            this.addOpChangelog(currentUser, newName, { "type": "rename", "message": oldNameChangelog + " renamed to " + newName });
        }

        let updateOld = false;
        if (removeOld) updateOld = true;

        if (!this.isPatchOp(newName)) this._log.verbose("*" + currentUser.username + " finished rename ");

        if (updateOld) this._docsUtil.updateOpDocs(oldName);
        const newOpDocs = this._docsUtil.updateOpDocs(newName);
        if (removeOld)
        {
            const versionNumbers = this.getOpVersionNumbers(oldName, newOpDocs);
            versionNumbers.forEach((version) =>
            {
                this._docsUtil.updateOpDocs(version.name);
            });
        }

        log.push("Successfully renamed " + oldName + " to " + newName);

        if (cb) cb(null, log, newJsonData);
        return true;
    }

    getScreenshot(opName)
    {
        const p = this.getOpAbsolutePath(opName);
        let buffer = " ";

        try
        {
            buffer = fs.readFileSync(path.join(p, "screenshot.png"), "binary");
        }
        catch (ex)
        {
            try
            {
                let fileName = "placeholder_dark.png";
                const placeholderPath = path.join(this._cables.getPublicPath(), "/img/", fileName);
                buffer = fs.readFileSync(placeholderPath);
            }
            catch (e)
            {
                this._log.error("error loading op screenshot and placeholder", opName);
            }
        }
        return buffer;
    }

    getOpEnvironmentUrls(opIdentifier)
    {
        if (!opIdentifier) return [];
        const env = this._cables.getEnv();
        const myUrl = new URL(this._cables.getConfig().url);

        const envUrls = [
            new URL("https://dev.cables.gl/api/doc/ops/" + opIdentifier + "?fromEnv=" + env),
            new URL("https://cables.gl/api/doc/ops/" + opIdentifier + "?fromEnv=" + env)
        ];
        const opEnvUrls = [];
        envUrls.forEach((envUrl) =>
        {
            if (envUrl.hostname !== myUrl.hostname)
            {
                opEnvUrls.push(envUrl);
            }
        });

        return opEnvUrls;
    }

    getOpEnvironmentDocs(opIdentifier, cb)
    {
        if (!opIdentifier)
        {
            cb("OP_NOT_FOUND", null);
            return;
        }
        const envUrls = this.getOpEnvironmentUrls(opIdentifier);

        const promises = [];
        const myUrl = new URL(this._cables.getConfig().url);
        envUrls.forEach((envUrl) => { promises.push(fetch(envUrl)); });

        const envDocs = {
            "id": null,
            "name": null,
            "checkedEnvironments": [myUrl.hostname, ...envUrls.map((envUrl) => { return envUrl.hostname; })],
            "environments": [],
            "docs": {}
        };

        Promise.allSettled(promises)
            .then((results) =>
            {
                const successfulRequests = results.filter((result) => { return result.status && result.status === "fulfilled"; });
                return Promise.all(successfulRequests.map((r) => { return r.value.json(); }));
            })
            .then((results) =>
            {
                results.forEach((result, i) =>
                {
                    if (result.opDocs && result.opDocs.length > 0)
                    {
                        const envName = envUrls[i].hostname;
                        envDocs.environments.push(envName);
                        const envDoc = result.opDocs[0];
                        envDocs.docs[envName] = envDoc;
                        if (!envDocs.id) envDocs.id = envDoc.id;
                        if (!envDocs.name) envDocs.name = envDoc.name;
                    }
                    else if (result.data && result.data.name)
                    {
                        const envName = envUrls[i].hostname;
                        envDocs.environments.push(envName);
                        const envDoc = {
                            "id": result.data.id,
                            "name": result.data.name
                        };
                        envDocs.docs[envName] = envDoc;
                        if (!envDocs.id) envDocs.id = envDoc.id;
                        if (!envDocs.name) envDocs.name = envDoc.name;
                    }
                });
                envDocs.environments = this._helperUtil.uniqueArray(envDocs.environments);
                cb(null, envDocs);
            });
    }
}

