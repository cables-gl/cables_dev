import path from "path";
import fs from "fs";
import jsonfile from "jsonfile";
import CablesWebpackHelper from "./webpack.helper.js";
import BuildUtil from "../build_util.js";

class CablesWebpackOpLoader {

    /**
     * @param {import("webpack").LoaderContext<Object>} loaderContext
     */
    constructor(loaderContext) {
        this._log = console;
        this._buildUtil = new BuildUtil(this._log);
        this._loaderContext = loaderContext;
        this._filename = loaderContext.resourcePath;
        this._dirname = loaderContext.context || path.dirname(this._filename);
        this._opName = path.basename(this._filename, ".js");
        const jsonFile = path.join(this._dirname, this._opName + ".json");
        loaderContext.addDependency(jsonFile);
        this._opDocs = {};
        try {
            this._opDocs = jsonfile.readFileSync(jsonFile);
        }catch (e) {
            this._log.warn("Could not read opdocs for", this._opName, e.message);
        }
    }

    build(code, options = {}) {
        const opDir = path.dirname(this._filename);
        this._loaderContext.addContextDependency(opDir);
        const attachments = [];
        fs.readdirSync(opDir).forEach((fileName) =>
        {
            if (!fileName.startsWith("att_")) return;
            const file = path.join(opDir, fileName);
            this._loaderContext.addDependency(file);
            if (fileName.startsWith("att_bin_"))
            {
                attachments.push({ "name": fileName, "content": fs.readFileSync(file) });
                return;
            }
            let content = fs.readFileSync(file, "utf8");
            if (fileName === BuildUtil.SUBPATCH_ATTACHMENT_NAME)
            {
                try
                {
                    content = JSON.stringify(CablesWebpackHelper.makeExportable(JSON.parse(content)));
                }
                catch (e)
                {
                    this._log.error("failed to parse", BuildUtil.SUBPATCH_ATTACHMENT_NAME, "during minify, keeping unminified", e);
                }
            }
            attachments.push({ "name": fileName, "content": content });
        });

        return this._buildUtil.getOpFullCode(this._opName, this._opDocs.id, code, attachments, true, options.minifyGlsl);
    }
}

// do not use arrow-function, needs proper `this`
export default function (code) {
    const options = this.getOptions();
    const loader = new CablesWebpackOpLoader(this);
    return loader.build(code, options);
}
