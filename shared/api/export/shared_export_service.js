import md5File from "md5-file";
import mkdirp from "mkdirp";
import sanitizeFileName from "sanitize-filename";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import os from "os";
import moment from "moment-mini";
import uglify from "uglify-js";
import SharedUtil from "../utils/shared_util.js";
import { UtilProvider } from "../utils/util_provider.js";
import { CablesConstants } from "../index.js";

/**
 * abstract class to handle different exports, see implementations like HtmlExport
 *
 * @abstract
 *
 * @param {UtilProvider} utilProvider
 * @param {Object} exportOptions
 * @param {"true"|"false"} exportOptions.hideMadeWithCables
 * @param {"true"|"false"} exportOptions.combineJS
 * @param {String} exportOptions.jsonName
 * @param {"true"|"false"} exportOptions.removeIndexHtml
 * @param {"true"|"false"} exportOptions.minify
 * @param {"true"|"false"} exportOptions.sourcemaps
 * @param {String} exportOptions.assets
 * @param {"true"|"false"} exportOptions.minifyGlsl
 * @param {Object} user
 *
 * @property {Object} options
 * @property {Boolean} [ignoreBackupBeforeExport=false]
 * @property {Boolean} options.hideMadeWithCables
 * @property {Boolean} options.combineJS
 * @property {String} options.jsonName
 * @property {Boolean} options.removeIndexHtml
 * @property {Boolean} options.flat
 * @property {Boolean} [options.minify=true]
 * @property {Boolean} options.sourcemaps
 * @property {"auto"|"all"|"none"} [options.handleAssets="auto"]
 * @property {String} options.minifyGlsl
 * @property {Boolean} options.opDocs
 * @property {Boolean} options.rewriteAssetPorts
 * @property {Boolean} options.flattenAssetNames
 * @property {Boolean} options.assetsInSubdirs
 * @property {String} [options.coreSrcFile="js/cables.js"]
 * @property {String} [options.coreSrcMapFile="js/cables.js.map"]
 * @property {String} [options.template="/patchview/patchview_export.html"]
 *
 */
export default class SharedExportService extends SharedUtil
{
    constructor(utilProvider, exportOptions, user)
    {
        super(utilProvider, false);

        this.user = user;
        this.exportLog = [];
        this.assetInfos = [];
        this.finalAssetPath = "assets/";
        this.finalAssetPathPrefix = "";
        this.finalJsPath = "js/";
        this.files = {};
        this.archive = null;

        this.options = exportOptions || {};
        this.options.logLevel = exportOptions.logLevel ? exportOptions.logLevel : "debug";
        this.options.hideMadeWithCables = exportOptions.hideMadeWithCables === "true";
        this.options.combineJS = exportOptions.hasOwnProperty("combineJS") ? exportOptions.combineJS === "true" : false;
        this.options.jsonName = exportOptions.jsonName;
        this.options.removeIndexHtml = exportOptions.removeIndexHtml;
        this.options.flat = exportOptions.flat;
        this.options.minify = exportOptions.hasOwnProperty("minify") ? exportOptions.minify : "true";
        this.options.sourcemaps = exportOptions.sourcemaps;
        this.options.handleAssets = exportOptions.assets || "auto";
        this.options.minifyGlsl = exportOptions.minifyGlsl;
        this.options.incrementExportCount = exportOptions.hasOwnProperty("incrementExportCount") ? exportOptions.incrementExportCount : true;

        this.options.ignoreBackupBeforeExport = exportOptions.ignoreBackupBeforeExport || false;

        this.options.template = "/patchview/patchview_export.html";
        this.options.coreSrcFile = "js/cables.js";
        this.options.coreSrcMapFile = "js/cables.js.map";

        this.options.opDocs = false;
        this.options.rewriteAssetPorts = true;
        this.options.flattenAssetNames = true;
        this.options.assetsInSubdirs = false;

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
     * @param {Project} originalProject
     * @param {Object} credentials
     * @param {Number} exportNumber
     * @param {Object} result
     * @return {Project}
     */
    _doAfterExport(originalProject, credentials, exportNumber, result)
    {
        return originalProject;
    }

    /**
     *
     * called after jsCode has been combined, if selected
     *
     * @param {String} jsCode
     * @param {any} options
     * @return {String} jsCode modified
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
    doExport(project, cb)
    {
        throw new Error("not implemented, abstract class");
    }

    getName()
    {
        return this.constructor.getName();
    }

    append(content, options)
    {
        let type = "content";
        if (options.type) type = options.type;
        const filename = options.name;
        if (filename)
        {
            this.files[filename] = {
                "type": type,
                "content": content
            };
        }
    }

    appendFile(filePath, zipFilePath, handleAssets)
    {
        let newChecksum = "";
        let stats = {};
        let ignore = false;
        try
        {
            newChecksum = md5File.sync(filePath);
            stats = fs.statSync(filePath);
        }
        catch (e)
        {
            // file might not exist, we handle this later
            ignore = true;
        }

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
            "size": Math.round(stats.size / 1024)
        });

        if (handleAssets === "none")
        {
            ignore = true;
        }

        if (!ignore) this.append(filePath, {
            "name": zipFilePath,
            "type": "path"
        });

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

    createZip(project, files, callbackFinished)
    {
        let zipFileName = this._projectsUtil.getExportFileName(project, this.getName());
        if (this.options.zipFileName) zipFileName = this.options.zipFileName;

        const zipPath = this._projectsUtil.getExportTargetPath(project);
        const zipLocation = path.join(zipPath, zipFileName);

        mkdirp.sync(zipPath);
        this._doZip(files, zipLocation, (result) =>
        {
            const downloadUrl = this._projectsUtil.getExportDownloadUrl(project, zipFileName);
            result.urls = {
                "downloadUrl": downloadUrl
            };
            callbackFinished(result);
        });
    }

    addLog(str, level = "info")
    {
        const logEntry = {
            "text": str,
            "level": level
        };
        this.exportLog.push(logEntry);
    }

    addLogError(str)
    {
        const logEntry = {
            "text": str,
            "level": "error"
        };
        this.exportLog.unshift(logEntry);
    }

    makeCablesFileJson(proj, keepAlso = [])
    {
        const exportNumber = proj.exports;
        let proJson = this._projectsUtil.makeReadable(proj, true);
        const keepInExport = ["_id", "ops", "shortId", "name", "ui", ...keepAlso];
        for (let key in proJson)
        {
            if (!keepInExport.includes(key)) delete proJson[key];
        }
        keepInExport.forEach((keep) =>
        {
            proJson[keep] = proj[keep];
        });
        proJson.export = {
            "time": moment().format(CablesConstants.DATE_FORMAT_LOGDATE),
            "service": this.getName(),
            "exportNumber": exportNumber
        };
        proJson = JSON.stringify(proJson, null, 4);
        return proJson;
    }

    /* private */

    _doZip(files, exportTargetLocation, callbackFinished)
    {
        if (!this.archive)
        {
            const outputErr = "No archiver found in subclass: " + this.getName();
            this._log.error("export error", outputErr);
            const result = { "error": outputErr };
            callbackFinished(result);
            return;
        }

        const archive = this.archive.create("zip", { "zlib": { "level": 0 }, "forceLocalTime": true });
        const output = fs.createWriteStream(exportTargetLocation);
        this._log.debug("finalZipFileName", exportTargetLocation);
        output.on("close", () =>
        {
            const size = archive.pointer() / 1000000.0;
            this._log.verbose("Exported file " + exportTargetLocation + " / " + size + " mb", (Date.now() - this.startTimeExport) / 1000);

            const result = {};
            result.zipLocation = exportTargetLocation;
            result.size = size;
            result.path = exportTargetLocation;
            result.log = this.exportLog;
            callbackFinished(result);
        });

        output.on("error", (outputErr) =>
        {
            this._log.error("export error", outputErr);
            const result = { "error": outputErr };
            callbackFinished(result);
        });

        this._log.debug("Appending files...", (Date.now() - this.startTimeExport) / 1000);
        for (const [filename, fileData] of Object.entries(files))
        {
            const options = { "name": filename };
            if (filename === "/patch.app/Contents/MacOS/Electron")
            {
                options.mode = 0o777;
            }
            if (fileData.type && fileData.type === "path")
            {
                archive.append(fs.createReadStream(fileData.content), options);

            }
            else
            {
                archive.append(fileData.content, options);
            }
        }

        this._log.debug("Piped output to zip...", (Date.now() - this.startTimeExport) / 1000);
        archive.pipe(output);
        this._log.debug("Finalize archive...", (Date.now() - this.startTimeExport) / 1000);
        archive.finalize();
    }

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
                const v = {
                    "opname": opName,
                    "comment": op.uiAttribs.comment
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
                    this._log.debug("ignored", vars[j]);
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
        this.addLog("Compiling credits.txt", "debug");
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
        const allFiles = [];
        const replacements = {};
        if (!proj) return replacements;

        const pathStr = this._projectsUtil.getAssetPathUrl(proj._id);

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
                    this.addLog("Added library file: " + libfn, "debug");
                }
                else
                {
                    this._log.error("Does not exist: ", pathfn);
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
                if (this.options.rewriteAssetPorts) filePathAndName = filePathAndName.replace(pathStr, this.finalAssetPath);
                let fn = this._resolveFileName(filePathAndName, pathStr, proj);
                if (!fn)
                {
                    this.addLogError("Unknown filename: " + filePathAndName);
                    this._log.error("Unknown filename:" + filePathAndName);
                    break;
                }
                else
                {
                    let pathfn = fn;
                    if (!fs.existsSync(fn))
                    {
                        pathfn = path.join(this._cables.getExportAssetTargetPath(), fn);
                    }
                    if (proj._id && !fs.existsSync(pathfn))
                    {
                        pathfn = path.join(this._projectsUtil.getAssetPath(proj._id), fn);
                        if (!fs.existsSync(pathfn))
                        {
                            pathfn = path.join(this._cables.getExportAssetTargetPath(), proj._id, fn);
                        }
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
                        if (fs.existsSync(pathfn))
                        {
                            const s = fs.statSync(pathfn);
                            if (s.isDirectory())
                            {
                                this.addLogError("ERROR: " + pathfn + " is directory");
                                this._log.error("ERROR: " + pathfn + " is directory");
                                break;
                            }

                            let lzipFileName = this._getNameForZipEntry(fn, allFiles);
                            if (!allFiles.includes(lzipFileName))
                            {
                                lzipFileName = this.appendFile(pathfn, lzipFileName, handleAssets);
                                allFiles.push(lzipFileName);
                            }
                            else
                            {
                                this.addLog("Skipped duplicate " + lzipFileName, "debug");
                            }

                            this.addLog("Added file: " + lzipFileName, "debug");
                            filePathAndName = this._getPortValueReplacement(filePathAndName, fn, lzipFileName);
                        }
                    }
                    catch (e)
                    {
                        this.addLogError("EXC ERROR: could not find file: " + pathfn + ": " + e.message);
                    }
                }

                if (this.options.rewriteAssetPorts)
                {
                    if (!replacements.hasOwnProperty(port.value)) replacements[port.value] = filePathAndName;
                    port.value = filePathAndName;
                }
            }
        }
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
        if (options.incrementExportCount) originalProject.exports++;
        const exportNumber = originalProject.exports;
        proj.exports = exportNumber;

        try
        {
            // add info files (docs, legal, LICENCE, ...)
            this._addInfoFiles(proj, options);

            // add subPatchOp ops
            this._getProjectDependencies(proj, options, (allProjects, usedOps, libs, coreLibs, replacedOpIds, jsCode, dependencies) =>
            {
                this.addLog("Number of unique ops: " + usedOps.length);

                this._log.debug("Export core file is", options.coreSrcFile);
                this._log.debug("Collect assets...", (Date.now() - this.startTimeExport) / 1000);

                this._getFilesForProjects(allProjects, options, (allFiles) =>
                {
                    if (!allFiles)
                    {
                        callbackError("DB_ERROR_FETCHING_FILES");
                        return;
                    }

                    // add assets
                    this._addAssets(proj, allFiles, options);
                    this._log.debug("Done collecting assets...", (Date.now() - this.startTimeExport) / 1000);

                    // check if all ops can be found to build code
                    const opNames = usedOps.filter((op) => { return this._opsUtil.getOpNameById(op.opId) || op.objName; });
                    const numMissingOps = usedOps.length - opNames.length;
                    if (numMissingOps === 0)
                    {
                        // build code
                        let opsCode = this._opsUtil.buildFullCode(usedOps, "none", false, false, null, true, options.minifyGlsl);

                        // handle asset path and opid replacements for code
                        let stringReplacements = {}; // replacedOpIds;
                        allProjects.forEach((project) => { stringReplacements = { ...stringReplacements, ...this._replaceAssetFilePathes(project, options.handleAssets) }; });
                        opsCode = this._replaceInString(stringReplacements, opsCode);
                        opsCode = this._replaceInString(replacedOpIds, opsCode);

                        // add js
                        this._log.debug("JS packaging...", (Date.now() - this.startTimeExport) / 1000);
                        this._addProjectJsCode(proj, opsCode, libs, coreLibs, replacedOpIds, jsCode, options, dependencies);
                        const exportContainsOps = this._addProjectOpCode(usedOps, options, stringReplacements);

                        if (exportContainsOps)
                        {
                            if (!proj.dirs) proj.dirs = {};
                            if (!proj.dirs.ops) proj.dirs.ops = [];
                            proj.dirs.ops.unshift("./ops");
                        }

                        // add html
                        let template = options.template;
                        this._log.debug("Exporting with html template from", template);
                        this._addProjectHtmlCode(proj, options, libs, coreLibs, template, dependencies);

                        // add screenshot
                        const proScreenshotPath = path.join(this._projectsUtil.getAssetPath(proj._id), "_screenshots", "screenshot.png");
                        if (fs.existsSync(proScreenshotPath)) this.append(proScreenshotPath, {
                            "name": "screenshot.png",
                            "type": "path"
                        });

                        // done adding everything, delegate to service for packaging, then return here to finish things up
                        callbackFilesCollected(proj, this.files, (result, credentials) =>
                        {
                            this._log.debug("Time used total", (Date.now() - this.startTimeExport) / 1000);
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
                            this._log.debug("file collecting ... ok");
                            this._doAfterExport(originalProject, credentials, exportNumber, result);

                            if (!result.error)
                            {
                                this.addLog("successfully exported as " + this.constructor.getName());
                            }
                            else if (result.error)
                            {
                                this.addLogError("<b>ERROR exporting to " + this.constructor.getName() + ":</b> " + result.message + " (" + result.code + " - " + result.name + ")");
                            }
                            result.log = this._filterLog(this.exportLog, this.options.logLevel);
                            result.exports = proj.exports;
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
        let dependencies = this._docsUtil.getProjectOpDependencies(proj, options.addOpCode);

        if (options.addOpCode)
        {
            dependencies.filter((dep) => { return dep.type === "op"; }).forEach((opDep) =>
            {
                const name = this._opsUtil.getOpNameById(opDep.src);
                if (name)
                {
                    usedOps.push({
                        "opId": opDep.src,
                        "name": name
                    });
                }
            });
        }

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
        let subPatchCount = 0;
        if (!subPatchOps) subPatchOps = [];
        subPatchOps.forEach((subPatchOp) =>
        {
            const opName = this._opsUtil.getOpNameById(subPatchOp.opId);
            const opDoc = this._docsUtil.getDocForOp(opName);

            if (opDoc)
            {
                if (opDoc.libs) libs = libs.concat(opDoc.libs);
                if (opDoc.coreLibs) coreLibs = coreLibs.concat(opDoc.coreLibs);
                if (opDoc.dependencies)
                {
                    dependencies = dependencies.concat(this._docsUtil.getProjectOpDependencies({ "ops": [{ "opId": opDoc.id }] }));
                }
            }

            if (this._opsUtil.isSubPatchOp(subPatchOp))
            {
                const subPatchOpAttachment = this._opsUtil.getSubPatchOpAttachment(opName);
                if (subPatchOpAttachment && subPatchOpAttachment.ops && subPatchOpAttachment.ops.length > 0)
                {
                    libs = libs.concat(this._docsUtil.getProjectLibs(subPatchOpAttachment));
                    coreLibs = coreLibs.concat(this._docsUtil.getCoreLibs(subPatchOpAttachment));

                    dependencies = dependencies.concat(this._docsUtil.getProjectOpDependencies(subPatchOpAttachment));

                    subPatchOpAttachment._id = proj._id;
                    subPatchOpAttachment.name = proj.name;

                    allProjects.push(subPatchOpAttachment);

                    if (options.combineJS)
                    {
                        for (let j = 0; j < subPatchOpAttachment.ops.length; j++)
                        {
                            const attOp = subPatchOpAttachment.ops[j];
                            let opId = attOp.opId;
                            let id = attOp.id;
                            const attOpName = this._opsUtil.getOpNameById(opId);
                            if (!id && this._opsUtil.isSubPatch(attOpName))
                            {
                                id = attOp.uiAttribs.subPatch;
                            }
                            if (!replacedOpIds.hasOwnProperty(id))
                            {
                                replacedOpIds[id] = "sp" + subPatchCount + "-" + j;
                            }
                        }
                    }
                }
                subPatchCount++;
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
        const uniqueDependencies = [];
        dependencies.forEach((dependency) =>
        {
            if (!uniqueDependencies.find((ud) => { return ud.type === dependency.type && ud.src === dependency.src && ud.opId === dependency.opId; }))
            {
                uniqueDependencies.push(dependency);
            }
        });
        cb(allProjects, usedOps, libs, coreLibs, replacedOpIds, jsCode, uniqueDependencies);
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
        if (options.minify && options.minify !== "false")
        {
            proJson = JSON.stringify(proJson);
        }
        else
        {
            proJson = JSON.stringify(proJson, null, 4);
        }
        return proJson;
    }

    _addInfoFiles(proj, options)
    {
        // add docs
        const varDocs = this._embeddingDoc(proj);
        if (varDocs.length > 0)
        {
            this.addLog("compiling doc.md", "debug");
            this.append(varDocs, { "name": "doc.md" });
        }

        // add credits
        const credits = this._getCredits(proj);
        this.append(credits.join("\n"), { "name": "credits.txt" });

        // add LICENCE
        const licence = this._getLicence();
        this.append(licence.join("\n"), { "name": "LICENCE" });

        // add info file
        const nfofile = path.join(this._cables.getApiPath(), "/cables.txt");
        this.append(nfofile, {
            "name": "cables.txt",
            "type": "path"
        });

        // add legal txt
        const legal = this._projectsUtil.getLicenceTextArray(proj);
        if (legal.length > 0)
        {
            this.addLog("compiling legal.txt", "debug");
            this.append(legal.join("\n"), { "name": "legal.txt" });
        }
    }

    _addProjectJsCode(proj, opsCode, libs, coreLibs, replacedOpIds, jsCode, options, dependencies)
    {
        const projectName = sanitizeFileName(proj.name).replace(/ /g, "_");
        const jsonFilename = sanitizeFileName(options.jsonName || projectName);

        this._log.debug("json...", (Date.now() - this.startTimeExport) / 1000);

        const proJson = this._getProjectJson(proj, replacedOpIds, options);
        if (proJson.includes("/assets/"))
        {
            this._projectsUtil.getProjectAssetPorts(proj).forEach((port) =>
            {
                if (port.value && port.value.includes("/assets/"))
                {
                    this.addLogError("WARNING! missing asset: <a href=\"" + this._cables.getConfig().url + "/asset/patches/?filename=" + port.value + "\">" + port.value + "</a>");
                }
            });
        }

        this._log.debug("libs...", (Date.now() - this.startTimeExport) / 1000);
        let libScripts = this._getLibsUrls(libs);
        libScripts = libScripts.concat(this._getCoreLibUrls(coreLibs));

        const depScripts = this._opsUtil.getDependencyUrls(dependencies.filter((d) => { return d.type && d.type === "commonjs"; }), this.finalJsPath);
        const depFiles = this._opsUtil.getDependencyUrls(dependencies.filter((d) => { return d.type && d.type !== "npm" && d.type !== "op"; }), this.finalJsPath);

        const coreFile = path.join(this._cables.getUiDistPath(), options.coreSrcFile);

        if (options.combineJS)
        {
            this._log.verbose("combine files!", options.coreSrcFile);

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

            this._log.debug("combine libs...", (Date.now() - this.startTimeExport) / 1000);

            for (let i = 0; i < libScripts.length; i++)
            {
                const lib = libScripts[i];
                if (lib.file)
                {
                    jsCode += "// start " + lib.src + "\n";
                    jsCode += fs.readFileSync(lib.file, "utf8");
                    jsCode += "// end " + lib.src + "\n";
                }
            }

            for (let i = 0; i < depScripts.length; i++)
            {
                const lib = depScripts[i];
                if (lib.src && !lib.src.startsWith("http"))
                {
                    if (lib.file)
                    {
                        jsCode += "// start " + lib.src + "\n";
                        jsCode += fs.readFileSync(lib.file, "utf8");
                        jsCode += "// end " + lib.src + "\n";
                    }
                }
            }

            jsCode = jsCode.replaceAll(/[\u2028]/g, " ");
            jsCode = jsCode.replaceAll(/[\u2029]/g, " ");
            jsCode = jsCode.replaceAll(/[\u00A0]/g, " ");

            jsCode = fs.readFileSync(coreFile, "utf8") + "\n" + jsCode;
            jsCode = this._doAfterCombine(jsCode, options);

            this._log.debug("append code...", (Date.now() - this.startTimeExport) / 1000);
            this.append(jsCode, { "name": this.finalJsPath + "patch.js" });

            for (let f = 0; f < depFiles.length; f++)
            {
                const fileData = depFiles[f];
                if (fileData.file && fileData.type !== "commonjs") this.append(fileData.file, {
                    "name": fileData.src,
                    "type": "path"
                });
            }
        }
        else
        {
            this.append(proJson, { "name": this.finalJsPath + jsonFilename + ".json" });

            opsCode += jsCode;
            opsCode += "\n";
            opsCode += "window.addEventListener('load', function(event) {\n";
            opsCode += "CABLES.jsLoaded=new Event('CABLES.jsLoaded');\n";
            opsCode += "document.dispatchEvent(CABLES.jsLoaded);\n";
            opsCode += "});\n";

            if (options.minify)
            {
                const minifyCore = fs.readFileSync(coreFile).toString();
                this.append(this._minifyCode(minifyCore, options, "cables.map.js").code, { "name": this.finalJsPath + "cables.js" });
                this.append(this._minifyCode(opsCode, options, "ops.map.js").code, { "name": this.finalJsPath + "ops.js" });

                for (let f = 0; f < libScripts.length; f++)
                {
                    const minifyLib = fs.readFileSync(libScripts[f].file).toString();
                    this.append(this._minifyCode(minifyLib, options, path.basename(libScripts[f].src).replaceAll(".js", ".map.js")).code, { "name": libScripts[f].src });
                }
                for (let f = 0; f < depFiles.length; f++)
                {
                    const fileData = depFiles[f];
                    if (fileData.file)
                    {
                        const minifyDep = fs.readFileSync(fileData.file).toString();
                        this.append(this._minifyCode(minifyDep, options, path.basename(fileData.src).replaceAll(".js", ".map.js")).code, { "name": fileData.src });
                    }
                }
            }
            else
            {
                this.append(coreFile, {
                    "name": this.finalJsPath + "cables.js",
                    "type": "path"
                });
                this.append(opsCode, { "name": this.finalJsPath + "ops.js" });

                for (let f = 0; f < libScripts.length; f++)
                {
                    this.append(libScripts[f].file, {
                        "name": libScripts[f].src,
                        "type": "path"
                    });
                }

                for (let f = 0; f < depFiles.length; f++)
                {
                    const fileData = depFiles[f];
                    if (fileData.file) this.append(fileData.file, {
                        "name": fileData.src,
                        "type": "path"
                    });
                }
            }

        }

        return replacedOpIds;
    }

    _minifyCode(jsCode, options, sourceMap = null)
    {
        let minified = {
            "code": jsCode
        };
        if (options.minify && options.minify !== "false")
        {
            const minifyOptions = { "compress": false, "mangle": true };
            if (options.sourcemaps)
            {
                minifyOptions.sourceMap = {
                    "url": sourceMap
                };
            }
            this._log.debug("minifying projectfile...", (Date.now() - this.startTimeExport) / 1000);
            minified = uglify.minify(jsCode, minifyOptions);
            if (minified.error)
            {
                this.addLogError("failed to minify code, exported unminified (" + minified.error + ")");
            }
            else if (options.sourcemaps && minified.map)
            {
                this._log.debug("adding sourcemaps....", (Date.now() - this.startTimeExport) / 1000);
                this.append(minified.map, { "name": this.finalJsPath + sourceMap });
            }
        }
        else
        {
            minified.code = minified.code.replace("sourceMappingURL=", "");
        }
        return minified;

    }

    _addProjectOpCode(usedOps, options, stringReplacements = {})
    {
        if (!options.addOpCode) return false;
        const includeAllOps = options.addOpCodeAll;
        let opsAdded = false;
        usedOps.forEach((op) =>
        {
            const opName = this._opsUtil.getOpNameById(op.opId);
            let includeOp = !this._opsUtil.isCoreOp(opName) && !this._opsUtil.isExtensionOp(opName);
            if (includeAllOps || includeOp)
            {
                const sourceDir = this._opsUtil.getOpSourceDir(opName);
                const targetDir = this._getOpExportSubdir(opName);
                const opFiles = this._helperUtil.getFilesRecursive(sourceDir);
                Object.keys(opFiles).forEach((opFile) =>
                {
                    const targetFile = path.join(targetDir, opFile);
                    let content = opFiles[opFile];
                    const baseName = path.basename(opFile);
                    if (baseName === this._opsUtil.SUBPATCH_ATTACHMENT_NAME || baseName === this._opsUtil.SUBPATCH_ATTACHMENT_PORTS)
                    {
                        content = this._replaceInString(stringReplacements, content.toString());
                    }
                    opsAdded = true;
                    this.append(content, { "name": targetFile });
                });
            }
        });
        return opsAdded;
    }

    _addProjectHtmlCode(proj, options, libs, coreLibs, template = "/patchview/patchview_export.html", dependencies = [])
    {
        let scriptTagsHtml = "";
        const projectName = sanitizeFileName(proj.name).replace(/ /g, "_");
        const jsonFilename = sanitizeFileName(options.jsonName || projectName);

        let indexhtml = fs.readFileSync(path.join(this._cables.getViewsPath(), template), "utf8");
        dependencies.forEach((dep) =>
        {
            this.addLog("adding dependency of op: " + dep.op + " - " + dep.src, "debug");
        });

        let preloadCssTags = "";
        let preloadJsTags = "";
        if (proj.preloadAssets)
        {
            proj.preloadAssets.forEach((preloadAsset) =>
            {
                if (preloadAsset.type === "CSS")
                {
                    preloadCssTags += "<link rel=\"stylesheet\" href=\"" + preloadAsset.url + "\">\n";
                }
                else if (preloadAsset.type === "javascript")
                {
                    preloadCssTags += "<script src=\"" + preloadAsset.url + "\">\n";
                }
            });
        }
        indexhtml = indexhtml.replace("<preloadcss/>", preloadCssTags);
        indexhtml = indexhtml.replace("<preloadjs/>", preloadJsTags);

        if (options.combineJS)
        {
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "patch.js\" async></script>";

            indexhtml = indexhtml.replace("{patchSource}", "patch: CABLES.exportedPatch");

            // dependencies to other ops are resolved earlier, code of local commonjs libraries is minified into patch.js, we only need cdn things and esm-modules here
            let libScriptsTags = this._opsUtil.getOpDependenciesScriptTags(dependencies.filter((dep) => { return dep.type && dep.type !== "op" && !(dep.type === "commonjs" && !dep.src.startsWith("http")); }), this.finalJsPath);
            indexhtml = indexhtml.replace("<libs/>", libScriptsTags);
            indexhtml = indexhtml.replace("<corelibs/>", "");
        }
        else
        {
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "cables.js\"></script>\n";
            scriptTagsHtml += "<script type=\"text/javascript\" src=\"" + this.finalJsPath + "ops.js\"></script>\n";

            this._log.debug("libs...", (Date.now() - this.startTimeExport) / 1000);
            let libScriptsTags = "";
            this._getLibsUrls(libs).forEach((lib) =>
            {
                this.addLog("adding library: " + lib.name, "debug");
                libScriptsTags += "<script type=\"text/javascript\"  src=\"" + lib.src + "\"></script>\n";
            });

            let coreLibScriptTags = "";
            this._getCoreLibUrls(coreLibs).forEach((coreLib) =>
            {
                this.addLog("adding core library: " + coreLib.name, "debug");
                coreLibScriptTags += "<script type=\"text/javascript\"  src=\"" + coreLib.src + "\"></script>\n";
            });

            libScriptsTags += this._opsUtil.getOpDependenciesScriptTags(dependencies, this.finalJsPath);

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
    }

    _getLibsUrls(libs)
    {
        // libs
        const libScripts = [];

        for (let l = 0; l < libs.length; l++)
        {
            const lib = libs[l];
            let libPath = path.join(this._cables.getLibsPath(), lib);
            let libSrc = path.join(this.finalJsPath, lib);
            if (this._libsUtil.isAssetLib(lib))
            {
                libPath = path.join(this._cables.getPublicPath(), lib);
            }
            libScripts.push({
                "name": lib,
                "file": libPath,
                "src": libSrc
            });
        }
        return libScripts;
    }

    _getCoreLibUrls(coreLibs)
    {
        const coreLibScripts = [];
        for (let l = 0; l < coreLibs.length; l++)
        {
            const coreLib = coreLibs[l];
            coreLibScripts.push({
                "name": coreLib,
                "file": path.join(this._cables.getCoreLibsPath(), coreLib + ".js"),
                "src": this.finalJsPath + coreLib + ".js"
            });
        }
        return coreLibScripts;
    }

    _addAssets(proj, allFiles, options)
    {
        const replacements = this._replaceAssetFilePathes(proj, options.handleAssets);
        if (options.handleAssets === "all")
        {
            for (let iaf = 0; iaf < allFiles.length; iaf++)
            {
                if (!allFiles[iaf].fileName) continue;
                const assetPath = this._getAssetPath(allFiles[iaf]);
                const assetUrl = path.join(this._projectsUtil.getAssetPathUrl(proj._id), allFiles[iaf].fileName);

                let assetDir = this.finalAssetPath;
                if (this.options.assetsInSubdirs) assetDir = path.join(assetDir, proj._id);

                let lzipFileName = path.join(assetDir, allFiles[iaf].fileName);
                if (!replacements.hasOwnProperty(assetUrl) && !allFiles.includes(lzipFileName))
                {
                    lzipFileName = this.appendFile(assetPath, lzipFileName, options.handleAssets);
                    allFiles.push(lzipFileName);
                }
            }
        }
        return replacements;
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
        let subDir = this._opsUtil.getOpSourceDir(opName, true);
        subDir = subDir.replace(this._cables.getOpsPath(), "");
        subDir = path.join("ops/", subDir);
        return subDir;
    }

    _resolveFileName(filePathAndName, pathStr, project)
    {
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
        const repl = path.join("assets/", fn);
        let value = filePathAndName.replace(repl, lzipFileName);
        value = value.replace(/^\/+/, "");
        if (this.finalAssetPathPrefix && !value.startsWith(this.finalAssetPathPrefix)) value = this.finalAssetPathPrefix + value;
        return value.replace(path.win32.sep, path.posix.sep);
    }

    _getAssetPath(file)
    {
        return path.join(this._cables.getAssetPath(), file.projectId, file.fileName);
    }

    _filterLog(exportLog = [], logLevel = "debug")
    {
        const filteredLog = [];
        if (exportLog)
        {
            for (let i = 0; i < exportLog.length; i++)
            {
                const logEntry = exportLog[i];
                const entryLevel = logEntry.level || "info";
                if (entryLevel === "debug" && logLevel !== "debug") continue;
                if (entryLevel === "info" && logLevel === "error") continue;
                filteredLog.push(logEntry);
            }
        }
        return filteredLog;
    }
}
