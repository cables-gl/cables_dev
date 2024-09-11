import md5File from "md5-file";
import sanitizeFileName from "sanitize-filename";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import os from "os";
import moment from "moment-mini";
import CablesConstants from "../constants.js";
import SharedUtil from "../utils/shared_util.js";
import { UtilProvider } from "../utils/util_provider.js";

/**
 * abstract class to handle different exports, see implementations like ZipExport
 *
 * @abstract
 */
export default class SharedExportService extends SharedUtil
{
    constructor(utilProvider, exportOptions)
    {
        super(utilProvider);

        this.exportLog = [];
        this.assetInfos = [];
        this.finalAssetPath = "assets/";
        this.finalJsPath = "js/";
        this.files = {};

        this.options = {};
        this.options.hideMadeWithCables = exportOptions.hideMadeWithCables === "true";
        this.options.combineJS = exportOptions.combineJS === "true";
        this.options.jsonName = exportOptions.jsonName;
        this.options.removeIndexHtml = exportOptions.removeIndexHtml;
        this.options.skipBackups = exportOptions.skipBackups;
        this.options.flat = exportOptions.flat;
        this.options.minify = exportOptions.hasOwnProperty("minify") ? exportOptions.minify : "true";
        this.options.sourcemaps = exportOptions.sourcemaps;
        this.options.handleAssets = exportOptions.assets || "auto";
        this.options.minifyGlsl = exportOptions.minifyGlsl;

        this.options.opDocs = false;
        this.options.rewriteAssetPorts = true;
        this.options.flattenAssetNames = true;
        this.options.assetsInSubdirs = false;

        this.options.coreSrcFile = "js/cables.js";
        this.options.coreSrcMapFile = "js/cables.js.map";

        this.startTimeExport = Date.now();
    }

    get utilName()
    {
        return UtilProvider.EXPORT_SERVICE;
    }

    /**
     *
     * called after export finished without error
     *
     * @param originalProject
     * @param credentials
     * @param exportNumber
     * @return originalProject
     * @abstract
     */
    _doAfterExport(originalProject, credentials, exportNumber)
    {
        return originalProject;
    }

    /**
     *
     * called after jsCode has been combined, if selected
     *
     * @param jsCode
     * @param options
     * @return jsCode
     * @abstract
     */
    _doAfterCombine(jsCode, options)
    {
        return jsCode;
    }

    /**
     * @abstract
     */
    collectFiles(projectId, callbackFilesCollected, callbackError, options, next)
    {
        throw new Error("not implemented, abstract class");
    }


    /**
     *
     * @param theProjects
     * @param options
     * @param cb
     * @abstract
     */
    _getFilesForProjects(theProjects, options, cb)
    {
        throw new Error("not implemented, abstract class");
    }

    /**
     * @abstract
     */
    static getName()
    {
        throw new Error("not implemented, abstract class");
    }

    /**
     * @abstract
     */
    static getExportOptions(_user, _teams, _project, _exportQuota)
    {
        throw new Error("not implemented, abstract class");
    }

    /**
     * @abstract
     */
    doExport(_projectId, cb)
    {
        throw new Error("not implemented, abstract class");
    }

    getName()
    {
        return this.constructor.getName();
    }

    append(content, options)
    {
        const filename = options.name;
        if (filename)
        {
            this.files[filename] = content;
        }
    }

    appendFile(filePath, zipFilePath, handleAssets)
    {
        const newChecksum = md5File(filePath);

        const stats = fs.statSync(filePath);

        let ignore = false;
        for (let i = 0; i < this.assetInfos.length; i++)
        {
            if (this.assetInfos[i].path === filePath && this.assetInfos[i].zipFilePath === zipFilePath)
            {
                ignore = true;
            }
        }

        this.assetInfos.push({
            "path": filePath,
            "zipFilePath": zipFilePath,
            "checkSum": newChecksum,
            "size": Math.round(stats.size / 1024),
        });

        if (handleAssets === "none")
        {
            this._log.warn("ignore ", filePath);
            ignore = true;
        }

        if (!ignore) this.append(fs.readFileSync(filePath), { "name": zipFilePath });

        return zipFilePath;
    }

    writeFilesToTempDir(fileData, finishedCallback)
    {
        const dirName = path.join(os.tmpdir(), "cables-export-");
        fs.mkdtemp(dirName, (err, folder) =>
        {
            if (err) throw err;
            for (const [name, data] of Object.entries(fileData))
            {
                const fullName = path.join(folder, name);
                fse.outputFileSync(fullName, data);
            }
            finishedCallback(folder);
        });
    }

    addLog(str)
    {
        const logEntry = {
            "text": str,
        };
        this.exportLog.push(logEntry);
    }

    addLogError(str, level = "error")
    {
        const logEntry = {
            "text": str,
            "level": level
        };
        this.exportLog.unshift(logEntry);
    }

    /* private */

    _embeddingDoc(proj)
    {
        let docs = "";
        const setters = {};
        const callbacks = [];
        const functions = [];

        for (let o = 0; o < proj.ops.length; o++)
        {
            const op = proj.ops[o];
            const opName = this._opsUtil.getOpNameById(op.opId) || op.objName;
            if (this._opsUtil.isVariableSetter(opName))
            {
                const v = { "opname": opName, "comment": op.uiAttribs.comment };

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
            else if (this._opsUtil.isCallbackOp(opName))
            {
                const c = {};
                for (let i = 0; i < op.portsIn.length; i++)
                {
                    if (op.portsIn[i].name === "Callback Name") c.name = op.portsIn[i].value;
                }

                if (c.name) callbacks.push(c);
            }
            else if (this._opsUtil.isFunctionOp(opName))
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
                if (vars[j].comment === "ignore")
                {
                    this._log.warn("ignored", vars[j]);
                    continue;
                }
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

    _getCredits(project)
    {
        this.addLog("compiling credits.txt");
        return this._projectsUtil.getCreditsTextArray(project);
    }

    _getLicence()
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
        return licenceText;
    }

    _replaceAssetFilePathes(proj, handleAssets)
    {
        const startTime = Date.now();
        const pathStr = this._projectsUtil.getAssetPathUrl(proj._id);
        const allFiles = [];
        const replacements = {};

        const assetPorts = this._projectsUtil.getProjectAssetPorts(proj, true);
        for (let i = 0; i < assetPorts.length; i++)
        {
            const port = assetPorts[i];
            let filePathAndName = port.value;

            if (this._filesUtil.isAssetLibraryLocation(port.value))
            {
                let assetLibLocation = "/assets/library/";
                let start = filePathAndName.indexOf(assetLibLocation);
                if (start === -1)
                {
                    assetLibLocation = "assets/library/";
                    start = filePathAndName.indexOf(assetLibLocation);
                }
                let libfn = filePathAndName.substr(start, filePathAndName.length - start);

                libfn = libfn.substr(assetLibLocation.length);

                const pathfn = path.join(this._cables.getAssetLibraryPath(), libfn);

                let assetZipFileName = path.join("assets/library/", libfn);

                if (this.options.flattenAssetNames)
                {
                    assetZipFileName = this.finalAssetPath + "lib_" + libfn.replace("/", "_");
                }

                if (fs.existsSync(pathfn))
                {
                    assetZipFileName = this.appendFile(pathfn, assetZipFileName, handleAssets);
                    this.addLog("added library file: " + libfn);
                }
                else
                {
                    this._log.error("does not exist: ", pathfn);
                }

                if (this.options.rewriteAssetPorts)
                {
                    filePathAndName = filePathAndName.replace("/assets/library/" + libfn, assetZipFileName);
                    if (!replacements.hasOwnProperty(port.value)) replacements[port.value] = filePathAndName;
                    port.value = filePathAndName;
                }
            }
            else
            {
                if (this.options.flattenAssetNames) filePathAndName = filePathAndName.replace(pathStr, this.finalAssetPath);
                let fn = filePathAndName.replace("assets/", "");

                if (!fn)
                {
                    this.addLogError("unknown filename: " + filePathAndName);
                    break;
                }
                else
                {
                    let pathfn = path.join(this._cables.getExportAssetTargetPath(), "/" + fn);

                    if (!fs.existsSync(pathfn))
                    {
                        pathfn = path.join(this._cables.getExportAssetTargetPath(), "/" + proj._id + "/" + fn);
                    }

                    if (!fs.existsSync(pathfn))
                    {
                        const parts = path.parse(pathfn);
                        if (parts && parts.ext.includes("?"))
                        {
                            const newExt = parts.ext.split("?", 1).join();
                            delete parts.base; // ??? - https://github.com/nodejs/node/issues/1999
                            parts.ext = newExt;
                            pathfn = path.format(parts);
                        }
                    }

                    try
                    {
                        const s = fs.statSync(pathfn);
                        if (s.isDirectory())
                        {
                            this.addLogError("ERROR: " + pathfn + " is directory");
                            this._log.error("ERROR: " + pathfn + " is directory");
                            break;
                        }
                        else if (fs.existsSync(pathfn))
                        {
                            if (fn.substr(0, 1) === "/") fn = fn.substr(1);
                            let fnNew = fn;
                            if (this.options.flattenAssetNames)
                            {
                                fnNew = fn.replace("/", "_");
                            }
                            let assetDir = this.finalAssetPath;
                            let lzipFileName = path.join(assetDir, fnNew);
                            if (allFiles.indexOf(lzipFileName) === -1)
                            {
                                lzipFileName = this.appendFile(pathfn, lzipFileName, handleAssets);
                                allFiles.push(lzipFileName);
                            }
                            else
                            {
                                this.addLog("skipped duplicate " + lzipFileName);
                            }

                            this.addLog("added file: " + lzipFileName);
                            filePathAndName = filePathAndName.replace("/assets/" + fn, lzipFileName);
                        }
                        else
                        {
                            this.addLogError("ERROR: could not find file: " + pathfn);
                        }
                    }
                    catch (e)
                    {
                        this.addLogError("EXC ERROR: could not process file: " + pathfn + ": " + e.message);
                    }
                }

                if (this.options.rewriteAssetPorts)
                {
                    if (!replacements.hasOwnProperty(port.value)) replacements[port.value] = filePathAndName;
                    port.value = filePathAndName;
                }
            }
        }
        const used = Date.now() - startTime;
        this._log.info("used", used / 1000);
        return replacements;
    }

    _exportProject(originalProject, callbackFilesCollected, callbackError, options, next)
    {
        const proj = JSON.parse(JSON.stringify(originalProject));
        options = options || {};

        if (options.flat)
        {
            this.finalJsPath = "";
            this.finalAssetPath = "";
        }

        if (!originalProject.exports) originalProject.exports = 0;
        originalProject.exports++;
        const exportNumber = originalProject.exports;
        proj.exports = exportNumber;

        try
        {
            // add backups
            this._addBackups(proj, options);

            // add info files (docs, legal, LICENCE, ...)
            this._addInfoFiles(proj, options);

            // add subPatchOp ops
            this._getProjectDependencies(proj, options, (allProjects, usedOps, libs, coreLibs, replacedOpIds, jsCode) =>
            {
                this.addLog("number of unique ops: " + usedOps.length);
                this.addLog("");

                this._log.info("export core file is", options.coreSrcFile);
                this._log.info("collect assets...", (Date.now() - this.startTimeExport) / 1000);

                this._getFilesForProjects(allProjects, options, (allFiles) =>
                {
                    if (!allFiles)
                    {
                        callbackError("DB_ERROR_FETCHING_FILES");
                        return;
                    }

                    // add assets
                    this._addAssets(proj, allFiles, options);
                    this._log.info("done collecting assets...", (Date.now() - this.startTimeExport) / 1000);

                    // check if all ops can be found to build code
                    const opNames = usedOps.filter((op) => { return this._opsUtil.getOpNameById(op.opId) || op.objName; });
                    const numMissingOps = usedOps.length - opNames.length;
                    if (numMissingOps === 0)
                    {
                        // build code
                        let opsCode = this._opsUtil.buildFullCode(usedOps, "none", false, false, null, true, options.minifyGlsl);

                        // handle asset path and opid replacements for code
                        let stringReplacements = {}; // replacedOpIds;
                        // allProjects.forEach((project) => { stringReplacements = { ...stringReplacements, ...this._replaceAssetFilePathes(project, options.handleAssets) }; });
                        opsCode = this._replaceInString(stringReplacements, opsCode);
                        opsCode = this._replaceInString(replacedOpIds, opsCode);

                        // add js
                        this._log.info("js packaging...", (Date.now() - this.startTimeExport) / 1000);
                        this._addProjectJsCode(proj, opsCode, libs, coreLibs, replacedOpIds, jsCode, options);
                        const exportContainsOps = this._addProjectOpCode(usedOps, options);
                        if (exportContainsOps)
                        {
                            if (!proj.dirs) proj.dirs = {};
                            if (!proj.dirs.ops) proj.dirs.ops = [];
                            proj.dirs.ops.unshift("./ops");
                        }

                        // add html
                        let template = options.template || "/patchview/patchview_export.html";
                        this._log.info("exporting with html template from", template);
                        this._addProjectHtmlCode(proj, options, libs, coreLibs, template);

                        // add screenshot
                        const proScreenshotPath = this._projectsUtil.getAssetPath(proj._id) + "/_screenshots/screenshot.png";
                        if (fs.existsSync(proScreenshotPath)) this.append(fs.readFileSync(proScreenshotPath), { "name": "screenshot.png" });

                        // done adding everything, delegate to service for packaging, then return here to finish things up
                        callbackFilesCollected(proj, this.files, (result, credentials) =>
                        {
                            this._log.info("time used all", (Date.now() - this.startTimeExport) / 1000);
                            this.assetInfos.sort((a, b) => { return b.size - a.size; });

                            if (this.assetInfos.length > 0)
                            {
                                let table = "List of Files:<br/><table>";
                                let filesInLog = [];
                                for (const i in this.assetInfos)
                                {
                                    const zipFilePath = this.assetInfos[i].zipFilePath;
                                    if (filesInLog.includes(zipFilePath)) continue;
                                    table += "<tr><td style=\"padding:3px;\"></td><td style=\"padding:3px;\"> " + zipFilePath + "</td><td style=\"padding:3px;\">- " + this.assetInfos[i].size + " kb</td></tr>";
                                    filesInLog.push(zipFilePath);
                                }
                                this.addLog(table + "</table>");
                            }
                            this._log.info("file collecting ... ok");
                            if (!result.error)
                            {
                                this._doAfterExport(originalProject, credentials, exportNumber);
                                this.addLog("");
                                this.addLog("successfully exported to: " + this.constructor.getName());
                            }
                            else if (result.error)
                            {
                                this.addLogError("<b>ERROR exporting to " + this.constructor.getName() + ":</b> " + result.message + " (" + result.code + " - " + result.name + ")");
                            }
                            result.log = this.exportLog;
                            next(null, result);
                        });
                    }
                    else
                    {
                        let otherEnv = "https://cables.gl";
                        if (this._cables.isLive()) otherEnv = "https://dev.cables.gl";
                        const err2 = "missing " + numMissingOps + " ops, did you save/create them on <a href=\"" + otherEnv + "/export/" + originalProject.shortId + "\">another environment</a>?";
                        callbackError(err2, (serviceResult) =>
                        {
                            next(serviceResult.msg, serviceResult, 422);
                        });
                    }
                });
            });
        }
        catch (exc)
        {
            this._log.error("exception exporter");
            this._log.error("exc", exc);

            const result = { "error": JSON.stringify(exc.message) };
            callbackError(result, (serviceResult) =>
            {
                next(serviceResult.msg, serviceResult);
            });
        }
    }

    _getProjectDependencies(proj, options, cb)
    {
        let jsCode = "";
        let usedOps = [];

        let libs = this._docsUtil.getProjectLibs(proj);
        let coreLibs = this._docsUtil.getCoreLibs(proj);

        let allProjects = [];
        const replacedOpIds = {};

        for (let j = 0; j < proj.ops.length; j++)
        {
            const projectOp = proj.ops[j];
            let id = projectOp.id;
            let opId = projectOp.opId;
            const opName = this._opsUtil.getOpNameById(opId);
            if (!id && this._opsUtil.isSubPatch(opName))
            {
                id = projectOp.uiAttribs.subPatch;
            }
            if (!replacedOpIds.hasOwnProperty(id))
            {
                replacedOpIds[id] = j;
            }
        }

        let subPatchOps = this._subPatchOpUtil.getOpsUsedInSubPatches(proj);
        let bpCount = 0;
        if (!subPatchOps) subPatchOps = [];
        subPatchOps.forEach((subPatchOp) =>
        {
            const opName = this._opsUtil.getOpNameById(subPatchOp.opId);
            const opDoc = this._docsUtil.getDocForOp(opName);
            if (opDoc)
            {
                if (opDoc.libs) libs = libs.concat(opDoc.libs);
                if (opDoc.coreLibs) coreLibs = coreLibs.concat(opDoc.coreLibs);
            }

            if (subPatchOp.storage && subPatchOp.storage.blueprintVer > 1)
            {
                const attBp = this._opsUtil.getSubPatchOpAttachment(opName);
                if (attBp && attBp.ops && attBp.ops.length > 0)
                {
                    libs = libs.concat(this._docsUtil.getProjectLibs(attBp));
                    coreLibs = coreLibs.concat(this._docsUtil.getCoreLibs(attBp));
                    allProjects.push(attBp);

                    if (options.combineJS)
                    {
                        for (let j = 0; j < attBp.ops.length; j++)
                        {
                            const attOp = attBp.ops[j];
                            let opId = attOp.opId;
                            let id = attOp.id;
                            const attOpName = this._opsUtil.getOpNameById(opId);
                            if (!id && this._opsUtil.isSubPatch(attOpName))
                            {
                                id = attOp.uiAttribs.subPatch;
                            }
                            if (!replacedOpIds.hasOwnProperty(id))
                            {
                                replacedOpIds[id] = "bp" + bpCount + "-" + j;
                            }
                        }
                    }
                }
                bpCount++;
            }
        });
        usedOps = usedOps.concat(subPatchOps);

        for (let o = 0; o < proj.ops.length; o++)
        {
            if (!usedOps.find((usedOp) => { return usedOp.opId === proj.ops[o].opId; })) usedOps.push(proj.ops[o]);
        }

        allProjects.push(proj);
        libs = this._helperUtil.uniqueArray(libs);
        coreLibs = this._helperUtil.uniqueArray(coreLibs);
        cb(allProjects, usedOps, libs, coreLibs, replacedOpIds, jsCode);
    }

    _getProjectJson(proj, replacedOpIds, options)
    {
        const exportNumber = proj.exports;
        let proJson = this._projectsUtil.makeExportable(proj);

        proJson.export = {
            "time": moment().format(CablesConstants.DATE_FORMAT_LOGDATE),
            "service": this.constructor.getName(),
            "exportNumber": exportNumber
        };
        proJson = JSON.stringify(proJson);
        return proJson;
    }

    _addInfoFiles(proj, options)
    {
        // add docs
        const varDocs = this._embeddingDoc(proj);
        if (varDocs.length > 0)
        {
            this.addLog("compiling doc.md");
            this.append(varDocs, { "name": "doc.md" });
        }

        // add credits
        const credits = this._getCredits(proj);
        this.append(credits.join("\n"), { "name": "credits.txt" });

        // add LICENCE
        const licence = this._getLicence();
        this.append(licence.join("\n"), { "name": "LICENCE" });

        // add info file
        const nfofile = fs.readFileSync(path.join(this._cables.getApiPath(), "/cables.txt"), "utf8");
        this.append(nfofile, { "name": "cables.txt" });

        // add legal txt
        const legal = this._projectsUtil.getLicenceTextArray(proj);
        if (legal.length > 0)
        {
            this.addLog("compiling legal.txt");
            this.append(legal.join("\n"), { "name": "legal.txt" });
        }
    }

    _addBackups(backupProject, options)
    {
        if (!options.skipBackups)
        {
            const projectNameVer = sanitizeFileName(backupProject.name).replace(/ /g, "_") + backupProject.exports;
            backupProject = this._projectsUtil.getBackup(backupProject);
            this.append(JSON.stringify(backupProject), { "name": this.finalJsPath + projectNameVer + "_backup.json" });
        }
    }

    _addProjectJsCode(proj, opsCode, libs, coreLibs, replacedOpIds, jsCode, options)
    {
        const projectName = sanitizeFileName(proj.name).replace(/ /g, "_");
        const jsonFilename = sanitizeFileName(options.jsonName || projectName);

        this._log.info("json...", (Date.now() - this.startTimeExport) / 1000);

        const proJson = this._getProjectJson(proj, replacedOpIds, options);
        if (proJson.indexOf("/assets/") > -1) this.addLog("WARNING: not all assets found!");

        this._log.info("libs...", (Date.now() - this.startTimeExport) / 1000);
        let libScripts = this._getLibsUrls(libs);
        libScripts = libScripts.concat(this._getCoreLibUrls(coreLibs));

        let libsCoreFile = this._cables.getUiDistPath() + "js/libs.core.js";
        const coreFile = path.join(this._cables.getUiDistPath(), options.coreSrcFile);

        if (options.combineJS)
        {
            this._log.info("combine files!", options.coreSrcFile);

            jsCode += "\n";
            jsCode += "if(!CABLES.exportedPatches) CABLES.exportedPatches={};";
            jsCode += "CABLES.exportedPatches['" + proj.shortId + "']=" + proJson + ";";

            jsCode += "\n";
            jsCode += "if(!CABLES.exportedPatch){CABLES.exportedPatch=CABLES.exportedPatches['" + proj.shortId + "']}";
            jsCode += "\n";
            jsCode += opsCode;
            jsCode += "\n";
            jsCode += "window.addEventListener('load', function(event) {\n";
            jsCode += "CABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
            jsCode += "document.dispatchEvent(CABLES.jsLoaded);\n";
            jsCode += "});\n";

            this._log.info("combine libs...", (Date.now() - this.startTimeExport) / 1000);

            for (let i = 0; i < libScripts.length; i++)
            {
                const lib = libScripts[i];
                this._log.info("lib.file!", lib.file);
                jsCode += "// start " + lib.src + "\n";
                jsCode += fs.readFileSync(lib.file, "utf8");
                jsCode += "// end " + lib.src + "\n";
            }

            jsCode = jsCode.replaceAll(/[\u2028]/g, " ");
            jsCode = jsCode.replaceAll(/[\u2029]/g, " ");
            jsCode = jsCode.replaceAll(/[\u00A0]/g, " ");

            jsCode = this._doAfterCombine(jsCode, options);

            this._log.info("append code...", (Date.now() - this.startTimeExport) / 1000);

            jsCode = fs.readFileSync(libsCoreFile, "utf8") + "\n" + jsCode;
            jsCode = fs.readFileSync(coreFile, "utf8") + "\n" + jsCode;

            this.append(jsCode, { "name": this.finalJsPath + "patch.js" });
        }
        else
        {
            this.append(proJson, { "name": this.finalJsPath + jsonFilename + ".json" });
            this.append(fs.readFileSync(libsCoreFile, "utf8"), { "name": this.finalJsPath + "libs.core.js" });
            this.append(fs.readFileSync(coreFile, "utf8"), { "name": this.finalJsPath + "cables.js" });

            opsCode += jsCode;
            opsCode += "\n";
            opsCode += "window.addEventListener('load', function(event) {\n";
            opsCode += "CABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
            opsCode += "document.dispatchEvent(CABLES.jsLoaded);\n";
            opsCode += "});\n";
            this.append(opsCode, { "name": this.finalJsPath + "ops.js" });

            for (let f = 0; f < libScripts.length; f++)
            {
                this.append(fs.readFileSync(libScripts[f].file, "utf8"), { "name": libScripts[f].src });
            }
        }

        return replacedOpIds;
    }

    _addProjectOpCode(usedOps, options, includeAllOps = false)
    {
        if (!options.addOpCode) return false;
        let opsAdded = false;
        usedOps.forEach((op) =>
        {
            const opName = this._opsUtil.getOpNameById(op.opId);
            if (includeAllOps || (!this._opsUtil.isCoreOp(opName) && !this._opsUtil.isExtensionOp(opName)))
            {
                const sourceDir = this._opsUtil.getOpSourceDir(opName);
                const targetDir = this._getOpExportSubdir(opName);
                const opFiles = this._helperUtil.getFilesRecursive(sourceDir);
                Object.keys(opFiles).forEach((opFile) =>
                {
                    const targetFile = path.join(targetDir, opFile);
                    const content = opFiles[opFile];
                    opsAdded = true;
                    this.append(content, { "name": targetFile });
                });
            }
        });
        return opsAdded;
    }

    _addProjectHtmlCode(proj, options, libs, coreLibs, template = "/patchview/patchview_export.html")
    {
        let scriptTagsHtml = "";
        const projectName = sanitizeFileName(proj.name).replace(/ /g, "_");
        const projectNameVer = sanitizeFileName(proj.name).replace(/ /g, "_") + proj.exports;
        const jsonFilename = sanitizeFileName(options.jsonName || projectName);

        let indexhtml = fs.readFileSync(path.join(this._cables.getViewsPath(), template), "utf8");
        if (options.combineJS)
        {
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "patch.js\" async></script>";

            indexhtml = indexhtml.replace("{patchSource}", "patch: CABLES.exportedPatch");
            indexhtml = indexhtml.replace("<libs/>", "");
            indexhtml = indexhtml.replace("<corelibs/>", "");
        }
        else
        {
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "libs.core.js\"></script>\n";
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "cables.js\"></script>\n";
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "ops.js\"></script>\n";

            this._log.info("libs...", (Date.now() - this.startTimeExport) / 1000);
            let libScriptsTags = "";
            this._getLibsUrls(libs).forEach((lib) =>
            {
                this.addLog("adding library: " + lib.name);
                libScriptsTags += "<script type=\"text/javascript\"  src=\"" + lib.src + "\"></script>\n";
            });

            let coreLibScriptTags = "";
            this._getCoreLibUrls(coreLibs).forEach((coreLib) =>
            {
                this.addLog("adding core library: " + coreLib.name);
                coreLibScriptTags += "<script type=\"text/javascript\"  src=\"" + coreLib.src + "\"></script>\n";
            });

            indexhtml = indexhtml.replace("{patchSource}", "patchFile: '" + this.finalJsPath + jsonFilename + ".json'");
            indexhtml = indexhtml.replace("<libs/>", libScriptsTags);
            indexhtml = indexhtml.replace("<corelibs/>", coreLibScriptTags);
        }
        indexhtml = indexhtml.replaceAll("{projectName}", proj.name);
        indexhtml = indexhtml.replace("<cablesjs/>", scriptTagsHtml);

        indexhtml = indexhtml.replaceAll("{assetPath}", this.finalAssetPath);
        indexhtml = indexhtml.replaceAll("{jsPath}", this.finalJsPath);

        const removeIndexHtml = options.removeIndexHtml || false;
        if (!removeIndexHtml) this.append(indexhtml, { "name": "index.html" });

        if (!options.skipBackups)
        {
            this.append(JSON.stringify(proj), { "name": this.finalJsPath + projectNameVer + "_backup_nopath.json" });
        }
    }

    _getLibsUrls(libs)
    {
        // libs
        const libScripts = [];

        for (let l = 0; l < libs.length; l++)
        {
            const lib = libs[l];
            let libPath = path.join(this._cables.getLibsPath(), "/", lib);
            let libSrc = path.join(this.finalJsPath, lib);
            if (this._libsUtil.isAssetLib(lib))
            {
                libPath = path.join(this._cables.getPublicPath(), lib);
            }
            libScripts.push({ "name": lib, "file": libPath, "src": libSrc });
        }
        return libScripts;
    }

    _getCoreLibUrls(coreLibs)
    {
        const coreLibScripts = [];
        for (let l = 0; l < coreLibs.length; l++)
        {
            const coreLib = coreLibs[l];
            coreLibScripts.push({ "name": coreLib, "file": path.join(this._cables.getCoreLibsPath(), coreLib + ".js"), "src": this.finalJsPath + coreLib + ".js" });
        }
        return coreLibScripts;
    }

    _addAssets(proj, allFiles, options)
    {
        this._replaceAssetFilePathes(proj, options.handleAssets);
        if (options.handleAssets === "all")
        {
            for (let iaf = 0; iaf < allFiles.length; iaf++)
            {
                if (!allFiles[iaf].fileName) continue;
                const pathfn = path.join(this._cables.getAssetPath(), allFiles[iaf].projectId, allFiles[iaf].fileName);

                let assetDir = this.finalAssetPath;
                if (this.options.assetsInSubdirs) assetDir = path.join(assetDir, proj._id);

                let lzipFileName = path.join(assetDir, allFiles[iaf].fileName);
                if (allFiles.indexOf(lzipFileName) === -1)
                {
                    lzipFileName = this.appendFile(pathfn, lzipFileName, options.handleAssets);
                    allFiles.push(lzipFileName);
                }
            }
        }
    }

    _replaceInString(replacements, theString)
    {
        if (Object.keys(replacements).length > 0)
        {
            let regEx = "(?:";
            Object.keys(replacements).forEach((key, i) =>
            {
                if (i > 0) regEx += "|";
                regEx += key;
            });
            regEx += ")";
            let regExp = new RegExp(regEx, "g");
            theString = theString.replaceAll(regExp, (key) => { return replacements[key]; });
        }
        return theString;
    }

    _getOpExportSubdir(opName)
    {
        if (opName.endsWith(".")) opName = opName.substring(0, opName.length - 1);
        let subDir = this._opsUtil.getOpSourceDir(opName);
        subDir = subDir.replace(this._cables.getOpsPath(), "");
        subDir = path.join("ops/", subDir);
        return subDir;
    }

    _resolveFileName(filePathAndName, pathStr, proj)
    {
        if (this.options.rewriteAssetPorts)
        {
            if (this.options.assetsInSubdirs)
            {
                let newAssetPath = this.finalAssetPath;
                // cant use path.join here since we need to keep the ./
                if (newAssetPath.endsWith(("/")))
                {
                    newAssetPath += proj._id + "/";
                }
                else
                {
                    newAssetPath = newAssetPath + "/" + proj._id + "/";
                }
                if (!filePathAndName.startsWith(this.finalAssetPath)) filePathAndName = filePathAndName.replace(pathStr, newAssetPath);
            }
            else
            {
                filePathAndName = filePathAndName.replace(pathStr, this.finalAssetPath);
            }
        }
        return filePathAndName.replace("assets/", "");
    }

    _getNameForZipEntry(fn, allFiles)
    {
        if (!fn) return "";
        if (fn.substr(0, 1) === "/") fn = fn.substr(1);
        let fnNew = fn;
        if (this.options.flattenAssetNames)
        {
            fnNew = fn.replaceAll("/", "_");
        }
        let assetDir = this.finalAssetPath;
        return path.join(assetDir, fnNew);
    }

    _getPortValueReplacement(filePathAndName, fn, lzipFileName)
    {
        return filePathAndName.replace("/assets/" + fn, lzipFileName);
    }
}
