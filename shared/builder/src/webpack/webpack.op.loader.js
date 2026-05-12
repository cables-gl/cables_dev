import path from "path";
import fs from "fs";
import tokenString from "glsl-tokenizer/string.js";
import jsonfile from "jsonfile";
import CablesWebpackHelper from "./webpack.helper.js";

class CablesWebpackOpLoader {

    constructor(loaderOptions) {
        this._log = console;
        this.SUBPATCH_ATTACHMENT_NAME = "att_subpatch_json";
        this.SUBPATCH_ATTACHMENT_PORTS = "att_ports.json";
        this._filename = loaderOptions.resourcePath;
        this._dirname = loaderOptions.context || path.dirname(this._filename);
        this._opName = path.basename(this._filename, ".js");
        const jsonFile = path.join(this._dirname, this._opName + ".json");
        this._opDocs = {};
        try {
            this._opDocs = jsonfile.readFileSync(jsonFile);
        }catch (e) {
            this._log.warn("Could not read opdocs for", this._opName, e.message);
        }
    }

    build(code, options = {}) {

        const fn = this._filename;
        const dir = fs.readdirSync(path.dirname(fn));
        const prepareForExport = true;
        const opName = this._opName;
        const opId = this._opDocs.id;
        const minifyGlsl = options.minifyGlsl;

        try
        {
            let codeAttachments = "const attachments=op.attachments={";
            let codeAttachmentsInc = "";
            let staticAttachments = "static staticAttachments={";
            for (const i in dir)
            {

                if (dir[i].startsWith("att_inc_"))
                {
                    codeAttachmentsInc += fs.readFileSync(path.dirname(fn) + "/" + dir[i], "utf8");
                }
                if (dir[i].startsWith("att_bin_"))
                {
                    let varName = dir[i].substr(8, dir[i].length - 8);
                    varName = varName.replace(/\./g, "_");
                    staticAttachments += "\"" + varName + "\":\"" + Buffer.from(fs.readFileSync(path.dirname(fn) + "/" + dir[i]))
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
                            subPatch = CablesWebpackHelper.makeExportable(subPatch);
                            subPatch = JSON.stringify(subPatch);
                            content = subPatch;
                        } catch (e)
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
                        } catch (e)
                        {
                            this._log.warn("failed to minify glsl, keeping unminified", opName, dir[i], e);
                        }
                    }
                    let varName = dir[i].substr(4, dir[i].length - 4);
                    varName = varName.replace(/\./g, "_");
                    codeAttachments += "\"" + varName + "\":" + JSON.stringify(attachment) + ",";
                }
            }

            staticAttachments += "};\n";
            codeAttachments += "};\n";

            const codeHead = "\n\n// **************************************************************\n" +
                "// \n" +
                "// " + opName + "\n" +
                "// \n" +
                "// **************************************************************\n\n" +
                opName + "= class extends CABLES.Op \n" +
                "{\n" +
                staticAttachments + "\n" +
                "constructor()\n" +
                "{\nsuper(...arguments);\nconst op=this;\nconst staticAttachments=this.constructor.staticAttachments;\n";
            let codeFoot = "\n}\n};\n\n";

            if (opId && !prepareForExport) codeFoot += "CABLES.OPS[\"" + opId + "\"]={f:" + opName + ",objName:\"" + opName + "\"};";
            codeFoot += "\n\n\n";

            return codeHead + codeAttachments + codeAttachmentsInc + code + codeFoot;
        } catch (e)
        {
            this._log.warn("getfullopcode fail", fn, opName, e);
        }

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
                if (token.type === "line-comment") continue;
                if (token.type === "block-comment") continue;

                if (token.type === "whitespace" && token.data === "\n" && tokens[i - 1].type === "line-comment") continue;

                if (token.type === "whitespace")
                {
                    if (token.data.indexOf("\n") === 0 && token.data.endsWith(" ")) token.data = "\n";

                    for (let j = 0; j < 3; j++)
                        token.data = token.data.replaceAll("\n\n", "\n");

                    token.data = token.data.replaceAll("\t", " ");

                    for (let j = 0; j < 3; j++)
                        token.data = token.data.replaceAll("  ", " ");

                    for (let j = 0; j < 2; j++)
                        token.data = token.data.replaceAll("\n\n", "\n");
                }

                if (token.type === "float")
                    while (token.data.indexOf(".") > 0 && token.data.endsWith("0"))
                        token.data = token.data.substring(0, token.data.length - 1);

                if (token.type === "whitespace" && token.data === " ")
                {
                    if (tokens[i - 1].type === "ident" && tokens[i + 1].type === "ident") continue;
                    if (tokens[i - 1].type === "ident" && tokens[i + 1].type === "operator") continue;
                    if (tokens[i - 1].type === "operator" && tokens[i + 1].type === "ident") continue;
                    if (tokens[i - 1].type === "operator" && tokens[i + 1].type === "float") continue;
                    if (tokens[i - 1].type === "operator" && tokens[i + 1].type === "keyword") continue;
                    if (tokens[i - 1].type === "operator" && tokens[i + 1].type === "operator") continue;
                    if (tokens[i + 1].type !== "ident" && tokens[i + 1].type !== "keyword" && tokens[i - 1].type !== "ident" && tokens[i - 1].type !== "keyword") continue;
                }
            }

            str += token.data;
        }

        return str;
    }
}

// do not use arrow-function, needs proper `this`
export default function (code) {
    const options = this.getOptions();
    const loader = new CablesWebpackOpLoader(this);
    return loader.build(code, options)
}

