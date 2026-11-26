import tokenString from "glsl-tokenizer/string.js";
import builderPackage from "../package.json" with { "type": "json" };

/**
 * everything that is only needed to build exports, without access to disk or server state
 */
export default class BuildUtil
{
    static SUBPATCH_ATTACHMENT_NAME = "att_subpatch_json";
    static SUBPATCH_ATTACHMENT_PORTS = "att_ports.json";
    static BUILDABLE_DIR = "_build";

    /**
     * @param {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}} [logger]
     */
    constructor(logger = console)
    {
        this._logger = logger;
    }

    /**
     * @returns {{"log": Function, "error": Function, "warn": Function, "info": Function, "debug": Function}}
     * @protected
     */
    get _log()
    {
        return this._logger;
    }

    /**
     * reduces a patch to what is needed to run it in an export, ops with an objName lose their opId
     * the objName of every op has to be set from its opId before, names stored in a patch can be outdated
     * the readable part has to be changed together with makeReadable in SharedProjectsUtil of shared/api
     *
     * @param {Object} p
     * @param {String[]} [keepAlso]
     * @returns {Object}
     */
    makeExportable(p, keepAlso = [])
    {
        const project = JSON.parse(JSON.stringify(p));
        const readable = {
            "_id": project._id,
            "id": project._id,
            "shortId": project.shortId,
            "name": project.name,
            "description": project.description,
            "link": project.link,
            "allowEdit": false,
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

        readable.ops = project.ops;

        const keepInExport = ["_id", "ops", ...keepAlso];
        const keepUiAttribs = ["subPatch"];

        for (let key in readable)
        {
            if (!keepInExport.includes(key)) delete readable[key];
        }

        for (let i = 0; i < readable.ops.length; i++)
        {
            const op = readable.ops[i];
            if (op.objName)
            {
                delete readable.ops[i].opId;
            }
            else if (op.opId)
            {
                this._log.error("NO OBJNAME BY ID IN EXPORT", p.shortId, op.opId);
            }
            else
            {
                this._log.error("NO OPID AND NO OBJNAME IN PROJECT", p.shortId, op);
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

    /**
     * @param {Boolean} flat
     * @returns {String}
     */
    getJsPath(flat)
    {
        if (flat) return "";
        return "js/";
    }

    /**
     * @param {Boolean} flat
     * @returns {String}
     */
    getAssetPath(flat)
    {
        if (flat) return "";
        return "assets/";
    }

    /**
     * ports of an op that point to a file, assets of the asset library only with includeLibraryAssets
     *
     * @param {Object} op
     * @param {Boolean} [includeLibraryAssets=false]
     * @returns {Object[]} the ports of the op, not copies
     */
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
                port.display === "file"
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

    /**
     *
     * @param {Object} project
     * @returns {String[]} values of all file ports of the patch, asset library included
     */
    getFilePortValues(project)
    {
        const values = [];
        if (!project || !project.ops) return values;
        project.ops.forEach((op) =>
        {
            this.getOpAssetPorts(op, true).forEach((port) => { values.push(port.value); });
        });
        return values;
    }

    /**
     *
     * @param {String} value file port value
     * @returns {{file: String, name: String}|null}
     */
    getAssetName(value)
    {
        const libIndex = value.indexOf("assets/library/");
        if (libIndex !== -1)
        {
            const libFile = value.substring(libIndex + "assets/library/".length);
            return { "file": "library/" + libFile, "name": "lib_" + libFile.replace("/", "_") };
        }
        const assetsIndex = value.indexOf("assets/");
        if (assetsIndex === -1) return null;
        const file = value.substring(assetsIndex + "assets/".length);
        return { "file": file, "name": file.replaceAll("/", "_") };
    }

    /**
     *
     * @param {Object} project
     * @param {Object[]} [subPatches]
     * @param {Boolean} [combineJs=true]
     * @returns {Object<String, String>}
     */
    getOpIdReplacements(project, subPatches = [], combineJs = true)
    {

        /** @type {Object<String, String>} */
        const replacements = {};
        if (project && project.ops)
        {
            project.ops.forEach((op, j) =>
            {
                let id = op.id;
                if (!id && op.uiAttribs) id = op.uiAttribs.subPatch;
                if (id && !replacements.hasOwnProperty(id)) replacements[id] = String(j);
            });
        }

        if (combineJs)
        {
            subPatches.forEach((subPatch, subPatchCount) =>
            {
                if (!subPatch || !subPatch.ops) return;
                subPatch.ops.forEach((op, j) =>
                {
                    let id = op.id;
                    if (!id && op.uiAttribs) id = op.uiAttribs.subPatch;
                    if (id && !replacements.hasOwnProperty(id)) replacements[id] = "sp" + subPatchCount + "-" + j;
                });
            });
        }
        return replacements;
    }

    /**
     *
     * @param {String} opName
     * @param {String} opId
     * @param {String} code
     * @param {{name: String, content: (String|Buffer)}[]} attachments
     * @param {Boolean} [prepareForExport=false]
     * @param {Boolean} [minifyGlsl=false]
     * @returns {String}
     */
    getOpFullCode(opName, opId, code, attachments, prepareForExport = false, minifyGlsl = false)
    {

        try
        {
            let codeAttachments = "";
            let codeAttachmentsInc = "";
            let codeStaticAttachments = "";
            attachments.forEach((attachmentFile) =>
            {
                const fileName = attachmentFile.name;
                if (fileName.startsWith("att_inc_"))
                {
                    codeAttachmentsInc += String(attachmentFile.content);
                }
                if (fileName.startsWith("att_bin_"))
                {
                    let varName = fileName.substr(8, fileName.length - 8);
                    varName = varName.replace(/\./g, "_");
                    codeStaticAttachments += "\"" + varName + "\":\"" + Buffer.from(attachmentFile.content).toString("base64") + "\",";
                }
                else if (fileName === BuildUtil.SUBPATCH_ATTACHMENT_PORTS)
                {
                    if (prepareForExport) return;
                    let varName = fileName.substr(4, fileName.length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(String(attachmentFile.content)) + ",";
                }
                else if (fileName.startsWith("att_"))
                {
                    let attachment = String(attachmentFile.content);
                    if (minifyGlsl && (fileName.endsWith(".att") || fileName.endsWith(".frag")))
                    {
                        try
                        {
                            attachment = this.minifyGlsl(attachment);
                        }
                        catch (e)
                        {
                            this._log.warn("failed to minify glsl, keeping unminified", opName, fileName, e);
                        }
                    }
                    let varName = fileName.substr(4, fileName.length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(attachment) + ",";
                }
            });

            let staticAttachments = "";
            if (codeStaticAttachments)
            {
                staticAttachments = "static staticAttachments={";
                staticAttachments += codeStaticAttachments;
                staticAttachments += "};\n\n";
            }

            let attachmentsCode = "";
            if (codeAttachments)
            {
                attachmentsCode = "const attachments=op.attachments={";
                attachmentsCode += codeAttachments;
                attachmentsCode += "};\n";
            }

            let codeHead = "\n\n// **************************************************************\n" +
                "// \n" +
                "// " + opName + "\n" +
                "// \n" +
                "// **************************************************************\n\n" +
                opName + "= class extends CABLES.Op \n" +
                "{\n" +
                staticAttachments +
                "constructor()\n" +
                "{\nsuper(...arguments);\nconst op=this;\n";

            if (staticAttachments)
            {
                codeHead += "const staticAttachments=this.constructor.staticAttachments;\n";
            }

            let codeFoot = "\n}\n};\n\n";
            if (opId && !prepareForExport) codeFoot += "CABLES.OPS[\"" + opId + "\"]={f:" + opName + ",objName:\"" + opName + "\"};";
            codeFoot += "\n\n\n";

            let fullCode = codeHead;
            if (attachmentsCode) fullCode += attachmentsCode;
            if (codeAttachmentsInc) fullCode += codeAttachmentsInc;
            fullCode += code;
            fullCode += codeFoot;
            return fullCode;
        }
        catch (e)
        {
            this._log.warn("getfullopcode fail", opName, e);
        }
        return "";
    }

    /**
     *
     * @param {String} shortId
     * @param {String} patchJson
     * @returns {String}
     */
    getExportedPatchCode(shortId, patchJson)
    {
        let code = "\n";
        code += "// start patch.json\n";
        code += "if(!CABLES.exportedPatches) CABLES.exportedPatches={};";
        code += "CABLES.exportedPatches['" + shortId + "']=" + patchJson + ";\n";
        code += "if(!CABLES.exportedPatch){CABLES.exportedPatch=CABLES.exportedPatches['" + shortId + "']};\n";
        code += "// end patch.json\n";
        return code;
    }

    /**
     * @returns {String}
     */
    getJsLoadedCode()
    {
        let code = "\n";
        code += "window.addEventListener('load', function(event) {\n";
        code += "CABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
        code += "document.dispatchEvent(CABLES.jsLoaded);\n";
        code += "});\n";
        return code;
    }

    /**
     * @param {String} name
     * @param {String} code
     * @returns {String}
     */
    getLibCode(name, code)
    {
        return "// start " + name + "\n" + code + "// end " + name + "\n";
    }

    /**
     *
     * @param {String} code
     * @returns {String}
     */
    cleanCombinedCode(code)
    {
        code = code.replaceAll(/[\u2028]/g, " ");
        code = code.replaceAll(/[\u2029]/g, " ");
        code = code.replaceAll(/[\u00A0]/g, " ");
        return code;
    }

    /**
     * @param {String} glsl
     * @returns {String}
     */
    minifyGlsl(glsl)
    {
        if (!glsl) return "";

        const tokens = tokenString(glsl);
        let str = "";
        for (let i = 0; i < tokens.length - 1; i++)
        {
            const token = tokens[i];

            // a comment ending in \ also comments out the next line in webgl2 but not in webgl1, so it is kept as it is
            if (token.type == "line-comment" && !token.data.includes("\n")) continue;
            // a space, so the words around it stay apart: float/*c*/a
            if (token.type == "block-comment")
            {
                token.type = "whitespace";
                token.data = " ";
            }

            if (i > 0)
            {
                if (token.type == "whitespace" && token.data == "\n" && tokens[i - 1].type == "line-comment" && !tokens[i - 1].data.includes("\n") && (i < 2 || tokens[i - 2].data.includes("\n"))) continue;

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

                if (token.type == "float" && !token.data.toLowerCase().includes("e"))
                    while (token.data.indexOf(".") > 0 && token.data.endsWith("0"))
                        token.data = token.data.substring(0, token.data.length - 1);

                // "a - -b" must not become "a--b"
                const lastChar = tokens[i - 1].data.slice(-1);
                const joinsSigns = (lastChar == "+" || lastChar == "-") && tokens[i + 1].data[0] == lastChar;

                if (token.type == "whitespace" && token.data == " " && !joinsSigns)
                {
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

    /**
     *
     * @param {String} str
     * @param {Object<String, String>} replacements
     * @returns {String}
     */
    replaceStrings(str, replacements)
    {
        const keys = Object.keys(replacements).sort((a, b) => { return b.length - a.length; });
        if (keys.length === 0) return str;
        const regExp = new RegExp(keys.map((key) => { return key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|"), "g");
        return str.replace(regExp, (key) => { return replacements[key]; });
    }

    /**
     * @returns {String}
     */
    getLicenceText()
    {
        const licenceText = [];
        licenceText.push("The MIT License (MIT)");
        licenceText.push("");
        licenceText.push("Copyright (c) 2015-present undefined development");
        licenceText.push("");
        licenceText.push("Permission is hereby granted, free of charge, to any person obtaining a copy of");
        licenceText.push("this software and associated documentation files (the \"Software\"), to deal in");
        licenceText.push("the Software without restriction, including without limitation the rights to");
        licenceText.push("use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies");
        licenceText.push("of the Software, and to permit persons to whom the Software is furnished to do");
        licenceText.push("so, subject to the following conditions:");
        licenceText.push("");
        licenceText.push("The above copyright notice and this permission notice shall be included in all");
        licenceText.push("copies or substantial portions of the Software.");
        licenceText.push("");
        licenceText.push("THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR");
        licenceText.push("IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,");
        licenceText.push("FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE");
        licenceText.push("AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER");
        licenceText.push("LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,");
        licenceText.push("OUT OF OR IN CONNECTION  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE");
        licenceText.push("SOFTWARE.");
        return licenceText.join("\n");
    }

    /**
     *
     * @returns {String}
     */
    getCablesInfoText()
    {
        return "\r\n\r\n     M  A  D  E    W  I  T  H \r\n\r\n             C   A   B   L   E   S   >>>  ___:_ _\r\n       _ _:_______________ _____________ /   |\\   _ _______\r\n          |  _           /\\\\_           \\    |\\\\.  _)     /\\       ______         \r\n    _____ | (/)        _/\\\\\\(_______    /    |\\\\| /    __/\\\\\\     /     /\\    \r\n   /   _/\\_      _    /_\\\\\\/_\\\\\\\\ _/   /     |\\\\|/     \\_\\\\\\/___ /     /\\\\\\ \r\n  /   /_\\\\|_     |\\     \\\\(    /\\ \\   /_    _:\\\\/__ /\\_/       /_\\   _/_\\\\/___\r\n_/   /(     \\    |_\\     \\__  /_\\\\_)    \\         (_          /   \\          /\\\r\n\\           _\\   \\___     _/             \\         /         /     \\_       /\\\\\\\r\n \\_________(    _|\\\\\\\\     \\_ ___________/   _    /_________/       /      /\\\\\\/\r\n  \\\\\\\\\\\\\\\\|_____)\\\\\\        |\\\\\\\\\\/         (/)  /\\\\\\\\\\\\\\/                /_\\\\/\r\n   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_______:\\\\.\\/______________/\\\\\\\\\\\\\\\\\\_________________(\\\\ \r\n _|.._     \\\\\\\\\\\\\\)  \\\\\\\\\\\\\\\\\\\\| \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/     \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\r\n(_|||_)               \\\\\\\\\\\\\\\\\\|  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/       \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\( \r\n ---|-->> \r\n\r\n\r\n";
    }

    /**
     * @param {Object[]} opDocs
     * @returns {String[]}
     */
    getCreditsTextArray(opDocs)
    {
        let credits = [];
        let first = true;
        opDocs.forEach((info) =>
        {
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
        });

        credits = [...new Set(credits)];

        credits.push("");
        credits.push("cables is built on open source software and community contributions, check https://cables.gl/support");

        return credits;
    }

    /**
     * @param {Object[]} opDocs
     * @param {String[]} libs
     * @param {Object<String, Object>} [libInfos]
     * @returns {String[]}
     */
    getLegalTextArray(opDocs, libs, libInfos = {})
    {
        const legal = {};

        opDocs.forEach((info) =>
        {
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
        });

        for (let i = 0; i < libs.length; i++)
        {
            const lib = libs[i];
            if (lib && lib.startsWith("/assets/") && lib.endsWith(".js"))
            {
                const licence = "uploaded/unknown";
                const filename = lib.substring(lib.lastIndexOf("/") + 1);
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
                const libInfo = libInfos[lib];
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

    /**
     *
     * @param {String} name
     * @param {String} [version]
     */
    getBuildablePackageJson(name, version)
    {
        const packageJson = {
            "name": name,
            "version": version || undefined,
            "private": true,
            "type": "module",
            "scripts": {
                "build": "webpack"
            },
            "devDependencies": {
                "@cables/builder": "^" + builderPackage.version,
                "webpack": builderPackage.devDependencies.webpack,
                "webpack-cli": builderPackage.devDependencies["webpack-cli"]
            }
        };
        return JSON.stringify(packageJson, null, 4) + "\n";
    }

    /**
     * npm dependencies of the ops for the package.json of headless exports, src is "name@version" or "name"
     *
     * @param {Object[]} opDocs
     * @returns {Object<String, String>}
     */
    getNpmDependencies(opDocs)
    {
        const npmDependencies = {};
        opDocs.forEach((opDoc) =>
        {
            if (!opDoc || !opDoc.dependencies) return;
            opDoc.dependencies.filter((d) => { return d.type === "npm" && d.src; }).forEach((dep) =>
            {
                const src = Array.isArray(dep.src) ? dep.src[0] : dep.src;
                const versionIndex = src.lastIndexOf("@");
                if (versionIndex > 0) npmDependencies[src.slice(0, versionIndex)] = src.slice(versionIndex + 1);
                else npmDependencies[src] = "*";
            });
        });
        return npmDependencies;
    }

    /**
     * package.json of headless exports, run.js loads the patch and libs listed in "cables"
     *
     * @param {String} name
     * @param {String} version
     * @param {Object<String, String>} npmDependencies
     * @param {String} patchFile patch json, relative to the package.json
     * @param {{src: String, type: String, export?: String}[]} libs in loading order, relative to the package.json
     * @param {{module: String, global?: String, export?: String}[]} [polyfills]
     * @returns {String}
     */
    getHeadlessPackageJson(name, version, npmDependencies, patchFile, libs, polyfills = [])
    {
        const packageJson = {
            "name": name,
            "version": version,
            "private": true,
            "type": "module",
            "main": "run.js",
            "scripts": {
                "start": "node run.js"
            },
            "dependencies": npmDependencies,
            "cables": {
                "patch": patchFile,
                "libs": libs,
                "polyfills": polyfills
            }
        };
        return JSON.stringify(packageJson, null, 4) + "\n";
    }

    /**
     *
     * @param {Object} project
     * @returns {String}
     */
    getEmbeddingDoc(project)
    {
        let docs = "";
        const setters = {};
        const callbacks = [];
        const functions = [];
        if (!project || !project.ops) return docs;

        for (let o = 0; o < project.ops.length; o++)
        {
            const op = project.ops[o];
            const opName = op.objName;
            if (!opName) continue;
            if (opName.startsWith("Ops.Vars.VarSet") || opName.startsWith("Ops.Vars.VarTrigger"))
            {
                const v = {
                    "opname": opName,
                    "comment": op.uiAttribs ? op.uiAttribs.comment : undefined
                };

                for (let i = 0; i < op.portsIn.length; i++)
                {
                    if (op.portsIn[i].name === "Variable") v.name = op.portsIn[i].value;
                    if (op.portsIn[i].name === "Value") v.value = op.portsIn[i].value;
                }

                if (opName.includes("String")) v.type = "String";
                else if (opName.includes("Number")) v.type = "Number";
                else if (opName.includes("Texture")) v.type = "Texture";
                else if (opName.includes("Object")) v.type = "Object";
                else if (opName.includes("Array")) v.type = "Array";

                if (v.name)
                {
                    const setterName = v.type + v.name;
                    if (setters.hasOwnProperty(setterName))
                    {
                        if (!setters[setterName].value)
                        {
                            setters[setterName] = v;
                        }
                    }
                    else
                    {
                        setters[setterName] = v;
                    }
                }
            }
            else if (opName.startsWith("Ops.Cables.Callback"))
            {
                const c = {};
                for (let i = 0; i < op.portsIn.length; i++)
                {
                    if (op.portsIn[i].name === "Callback Name") c.name = op.portsIn[i].value;
                }

                if (c.name) callbacks.push(c);
            }
            else if (opName.startsWith("Ops.Cables.Function"))
            {
                const c = {};
                for (let i = 0; i < op.portsIn.length; i++)
                {
                    if (op.portsIn[i].name === "Function Name") c.name = op.portsIn[i].value;
                }

                if (c.name) functions.push(c);
            }
        }

        const vars = Object.values(setters);
        if (vars.length > 0)
        {
            docs += "## Patch Variables:\n\n";

            vars.sort((a, b) => { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });

            for (let j = 0; j < vars.length; j++)
            {
                if (vars[j].comment === "ignore") continue;
                docs += "* __" + vars[j].name + "__ ";

                if (vars[j].type) docs += "```" + vars[j].type + "```";
                if (typeof vars[j].value !== "undefined") docs += " (default Value: `" + vars[j].value + "`)";

                docs += "\n";

                if (vars[j].comment)
                {
                    const cmt = vars[j].comment.replace(/(\r\n|\n|\r)/gm, "\n  ");
                    docs += "\n  " + cmt + "\n\n";
                }
            }
            docs += "\n";
        }

        if (callbacks.length > 0)
        {
            docs += "## Patch Callbacks:\n\n";

            for (let j = 0; j < callbacks.length; j++)
                docs += "* " + callbacks[j].name + "\n\n";
        }

        if (functions.length > 0)
        {
            docs += "## Patch Functions:\n\n";

            for (let j = 0; j < functions.length; j++)
                docs += "* " + functions[j].name + "\n";
        }

        return docs;
    }
}
