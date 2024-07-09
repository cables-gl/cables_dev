import fs from "fs/promises";

import hljs from "highlight.js";
import { util } from "documentation";
import GithubSlugger from "github-slugger";
import template from "lodash/template.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { LinkerStack, createFormatters } = util;

const copyDir = async (source, dest) =>
{
    await fs.mkdir(dest, { "recursive": true });
    let entries = await fs.readdir(source, { "withFileTypes": true });

    for (let entry of entries)
    {
        let srcPath = path.join(source, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory()
            ? await copyDir(srcPath, destPath)
            : await fs.copyFile(srcPath, destPath);
    }
};

const isFunction = (section) =>
{
    return (
        section.kind === "function" ||
        (section.kind === "typedef" &&
            section.type &&
            section.type.type === "NameExpression" &&
            section.type.name === "Function")
    );
};

const slugger = new GithubSlugger();
const slugs = {};

function getSlug(str)
{
    if (slugs[str] === undefined)
    {
        slugs[str] = slugger.slug(str);
    }
    return slugs[str];
}

export default async (comments, config) =>
{
    let linkerStack = new LinkerStack(config).namespaceResolver(
        comments,
        (namespace) =>
        {
            return "#" + getSlug(namespace);
        }
    );

    let formatters = createFormatters(linkerStack.link);

    hljs.configure(config.hljs || {});

    let sharedImports = {
        "imports": {
            slug(str)
            {
                return getSlug(str);
            },
            shortSignature(section)
            {
                let prefix = "";
                if (section.kind === "class")
                {
                    prefix = "new ";
                }
                else if (!isFunction(section))
                {
                    return section.name;
                }
                return prefix + section.name + formatters.parameters(section, true);
            },
            signature(section)
            {
                let returns = "";
                let prefix = "";
                if (section.kind === "class")
                {
                    prefix = "new ";
                }
                else if (!isFunction(section))
                {
                    return section.name;
                }
                if (section.returns.length)
                {
                    returns = ": " + formatters.type(section.returns[0].type);
                }
                return prefix + section.name + formatters.parameters(section) + returns;
            },
            md(ast, inline)
            {
                if (
                    inline &&
          ast &&
          ast.children.length &&
          ast.children[0].type === "paragraph"
                )
                {
                    ast = {
                        "type": "root",
                        "children": ast.children[0].children.concat(ast.children.slice(1))
                    };
                }
                return formatters.markdown(ast);
            },
            "formatType": formatters.type,
            "autolink": formatters.autolink,
            highlight(example)
            {
                if (config.hljs && config.hljs.highlightAuto)
                {
                    return hljs.highlightAuto(example).value;
                }
                return hljs.highlight(example, { "language": "js" }).value;
            }
        }
    };

    sharedImports.imports.renderSectionList = template(
        await fs.readFile(path.join(__dirname, "section_list._"), "utf8"),
        sharedImports
    );
    sharedImports.imports.renderSection = template(
        await fs.readFile(path.join(__dirname, "section._"), "utf8"),
        sharedImports
    );
    sharedImports.imports.renderNote = template(
        await fs.readFile(path.join(__dirname, "note._"), "utf8"),
        sharedImports
    );
    sharedImports.imports.renderParamProperty = template(
        await fs.readFile(path.join(__dirname, "paramProperty._"), "utf8"),
        sharedImports
    );

    let pageTemplate = template(
        await fs.readFile(path.join(__dirname, "index._"), "utf8"),
        sharedImports
    );

    const string = pageTemplate({ "docs": comments, config });

    if (!config.output)
    {
        return string;
    }

    await copyDir(path.join(__dirname, "/assets/"), config.output + "/assets/");
    await fs.writeFile(config.output + "/index.html", string, "utf8");
};
