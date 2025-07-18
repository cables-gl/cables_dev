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
                return new Handlebars.SafeString(escaped);
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

            Handlebars.registerHelper("logdate", (str) =>
            {
                if (helper.isNumeric(str) && String(str).length < 11) str *= 1000;
                let date;
                if (str && moment)
                {
                    date = moment(str).format(CablesConstants.DATE_FORMAT_LOGDATE);
                }
                else
                {
                    date = "";
                }
                return new Handlebars.SafeString("<span title=\"" + date + "\">" + date + "</span>");
            });

            Handlebars.registerHelper("displaydate", (str) =>
            {
                if (helper.isNumeric(str) && String(str).length < 11) str *= 1000;
                let date = str;
                let displayDate;
                if (str && moment)
                {
                    const m = moment(str);
                    date = m.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_DATE);
                    displayDate = m.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_DISPLAY);
                }
                else
                {
                    displayDate = "";
                }
                return new Handlebars.SafeString("<span title=\"" + date + "\">" + displayDate + "</span>");
            });

            Handlebars.registerHelper("tooltipdate", (str) =>
            {
                if (helper.isNumeric(str) && String(str).length < 11) str *= 1000;
                let displayDate;
                if (str && moment)
                {
                    const m = moment(str);
                    displayDate = m.format(CablesConstants.DATE_FORMAT_TOOLTIPDATE);
                }
                else
                {
                    displayDate = "";
                }
                return new Handlebars.SafeString(displayDate);
            });

            Handlebars.registerHelper("displaydateNoTime", (str) =>
            {
                if (helper.isNumeric(str) && String(str).length < 11) str *= 1000;
                let date = str;
                let displayDate = str;
                if (moment)
                {
                    const m = moment(str);
                    date = m.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_NO_TIME_DATE);
                    displayDate = m.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_NO_TIME_DISPLAY);
                }
                return new Handlebars.SafeString("<span title=\"" + date + "\">" + displayDate + "</span>");
            });

            Handlebars.registerHelper("relativedate", (str) =>
            {
                if (helper.isNumeric(str) && String(str).length < 11) str *= 1000;
                let date = str;
                let displayDate;
                if (str && moment)
                {
                    const m = moment(str);
                    displayDate = m.fromNow();
                    if (m.isBefore(moment().subtract(7, "days"))) displayDate = moment(date).format(CablesConstants.DATE_FORMAT_RELATIVEDATE_FULL);
                    date = m.format(CablesConstants.DATE_FORMAT_RELATIVEDATE_FULL);
                }
                else
                {
                    date = "";
                    displayDate = "";
                }
                return new Handlebars.SafeString("<span title=\"" + date + "\">" + displayDate + "</span>");
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
        let link = "/op/";
        if (CABLES && CABLES.platform) link = CABLES.platform.getCablesUrl() + link;
        // eslint-disable-next-line no-useless-escape
        const urlPattern = /\b(?:Ops\.)[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        let replaceValue = "<a href=\"" + link + "$&\">$&</a>";
        if (linkTarget) replaceValue = "<a href=\"" + link + "$&\" target=\"" + linkTarget + "\">$&</a>";
        html = html.replace(urlPattern, replaceValue);
        return html;
    }

}
export default new HandlebarsHelper();
