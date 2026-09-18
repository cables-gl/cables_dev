import helper from "./helper.js";
import { CablesConstants } from "../index.js";

class HandlebarsHelper
{
    initHandleBarsHelper()
    {
        if (window.Handlebars)
        {
            Handlebars.registerHelper("urlencode", (str) =>
            {
                return new Handlebars.SafeString(encodeURIComponent(str));
            });

            Handlebars.registerHelper("md", (str, setOpLinks = false, linkTarget = "") =>
            {
                if (!str) return "";
                let escaped = Handlebars.escapeExpression(str);
                if (marked) escaped = marked.parse(escaped);
                if (setOpLinks) escaped = this._setOpLinks(escaped, linkTarget);
                return new Handlebars.SafeString("<div class=\"markdown\">" + escaped + "</div>");
            });

            Handlebars.registerHelper("round", (str) =>
            {
                if (helper.isNumeric(str))
                {
                    str = String(Math.round(parseFloat(str)));
                }
                return str;
            });

            Handlebars.registerHelper("twoDigits", (str) =>
            {
                if (!str) return "0.00";
                let parsed = parseFloat(str);
                if (!parsed) return "0.00";
                return parsed.toFixed(2);
            });

            Handlebars.registerHelper("toInt", (str) =>
            {
                if (!str) return "0";
                let parsed = parseInt(str);
                if (!parsed) return "0";
                return parsed;
            });

            Handlebars.registerHelper("json", (context) =>
            {
                let str = "";
                try
                {
                    str = JSON.stringify(context, true, 4);
                }
                catch (e)
                {
                    console.error(e);
                }

                return str;
            });

            Handlebars.registerHelper("console", (context) =>
            {
                return console.log(context);
            });

            Handlebars.registerHelper("opLayout", (opName) =>
            {

                return new Handlebars.SafeString(gui.opDocs.getLayoutSvg(opName));
            });

            // don't change to arrow-function to keep the right `arguments` for context
            Handlebars.registerHelper("compare", function (left_value, operator, right_value, options)
            {
                let operators, result;

                if (arguments.length < 4)
                {
                    throw new Error("Handlerbars Helper 'compare' needs 3 parameters, left value, operator and right value");
                }

                operators = {
                    "==": function (l, r) { return l == r; },
                    "===": function (l, r) { return l === r; },
                    "!=": function (l, r) { return l != r; },
                    "<": function (l, r) { return l < r; },
                    ">": function (l, r) { return l > r; },
                    "<=": function (l, r) { return l <= r; },
                    ">=": function (l, r) { return l >= r; },
                    "typeof": function (l, r) { return typeof l == r; }
                };

                if (!operators[operator])
                {
                    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
                }

                result = operators[operator](left_value, right_value);

                if (result === true)
                {
                    return options.fn(this);
                }
                else
                {
                    return options.inverse(this);
                }
            });

            Handlebars.registerHelper("toUpperCase", (str) =>
            {
                if (str && typeof str === "string")
                {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }
                return "";
            });

            // don't change to arrow-function to keep the right `this` for context
            Handlebars.registerHelper("paginationLoop", function (block)
            {
                let currentPage = Number(this.currentPage) || 0;
                let to = currentPage + 19;
                if (to > this.pages)
                {
                    to = this.pages;
                }

                let from = currentPage - 10;
                if (from < 1) from = 1;

                const numTabs = 19;

                if ((currentPage + numTabs) > this.pages)
                {
                    from = this.pages - numTabs;
                }

                if (from < 1) from = 1;

                let accum = "";
                let count = 0;
                for (let i = from; i <= to; i++)
                {
                    if (count > numTabs) break;
                    let last = (i === to);
                    if (count === numTabs) last = true;
                    accum += block.fn({ "page": i, "last": last, "first": i == from });
                    count++;
                }

                return accum;
            });

            Handlebars.registerHelper("logdate", (str, options) =>
            {
                const showFuture = options?.hash?.hasOwnProperty("future") && options.hash.future === "true";
                const showTitle = !options?.hash?.hasOwnProperty("title") || options.hash.title !== "false";
                const date = helper.formatDate(str, "logdate", showFuture);
                let output = "<span title=\"" + date.date + "\">" + date.date + "</span>";
                if (!showTitle) output = "<span>" + date.date + "</span>";
                return new Handlebars.SafeString(output);
            });

            Handlebars.registerHelper("displaydate", (str, options) =>
            {
                const showFuture = options?.hash?.hasOwnProperty("future") && options.hash.future === "true";
                const showTitle = !options?.hash?.hasOwnProperty("title") || options.hash.title !== "false";
                const date = helper.formatDate(str, "displaydate", showFuture);
                let output = "<span title=\"" + date.date + "\">" + date.displayDate + "</span>";
                if (!showTitle) output = "<span>" + date.displayDate + "</span>";
                return new Handlebars.SafeString(output);
            });

            Handlebars.registerHelper("tooltipdate", (str, options) =>
            {
                const showFuture = options?.hash?.hasOwnProperty("future") && options.hash.future === "true";
                const date = helper.formatDate(str, "tooltipdate", showFuture);
                return new Handlebars.SafeString(date.displayDate);
            });

            Handlebars.registerHelper("displaydateNoTime", (str, options) =>
            {
                const showFuture = options?.hash?.hasOwnProperty("future") && options.hash.future === "true";
                const showTitle = !options?.hash?.hasOwnProperty("title") || options.hash.title !== "false";
                const date = helper.formatDate(str, "displaydateNoTime", showFuture);
                let output = "<span title=\"" + date.date + "\">" + date.displayDate + "</span>";
                if (!showTitle) output = "<span>" + date.displayDate + "</span>";
                return new Handlebars.SafeString(output);
            });

            Handlebars.registerHelper("relativedate", (str, options) =>
            {
                const showFuture = options?.hash?.hasOwnProperty("future") && options.hash.future === "true";
                const showTitle = !options?.hash?.hasOwnProperty("title") || options.hash.title !== "false";
                const date = helper.formatDate(str, "relativedate", showFuture);
                let output = "<span title=\"" + date.date + "\">" + date.displayDate + "</span>";
                if (!showTitle) output = "<span>" + date.displayDate + "</span>";
                return new Handlebars.SafeString(output);
            });

            Handlebars.registerHelper("textconstant", (str) =>
            {
                const locale = "en";
                return CablesConstants.text[locale][str];
            });

            Handlebars.registerHelper("constants", (path) =>
            {
                if (!path) return "";
                const constant = helper.pathLookup(CablesConstants, path);
                if (constant) return constant;
                return path;
            });
        }
    }

    _setOpLinks(html, linkTarget = "")
    {
        html = html || "";
        html = html.trim();
        const paragraph = html.startsWith("<p>");
        if (paragraph) html = html.replace("<p>", "");
        let link = "/op/";
        if (CABLES && CABLES.platform) link = CABLES.platform.getCablesUrl() + link;
        // eslint-disable-next-line no-useless-escape
        const urlPattern = /\b(?:^|\sOps\.)[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        let replaceValue = "<a href=\"" + link + "$&\">$&</a>";
        if (linkTarget) replaceValue = "<a href=\"" + link + "$&\" target=\"" + linkTarget + "\">$&</a>";
        html = html.replaceAll(urlPattern, (match, offset, string, groups) =>
        {
            const prefix = match.startsWith(" ") ? " " : "";
            let replacement = match.trim();
            if (replacement.startsWith("Ops.")) replacement = prefix + replaceValue.replaceAll("$&", replacement);
            return replacement;
        });
        if (paragraph) html = "<p>" + html;
        return html;
    }

}
export default new HandlebarsHelper();
