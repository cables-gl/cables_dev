import moment from "moment";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
/* eslint-disable no-console */
export default class SharedLogger extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
        this._services = [];
        // register console output, will include "verbose"
        this._services.push({
            "name": "console",
            "levels": ["verbose", "info", "warn", "error", "uncaught", "startTime", "endTime"],
            "log": this._logConsole.bind(this),
            "active": true
        });
    }

    get utilName()
    {
        return UtilProvider.LOGGER;
    }

    get _initiator()
    {
        return this.constructor.name || "logger";
    }

    _log(...args)
    {
        this.info(...args);
    }

    debug(...args)
    {
        this.verbose(...args);
    }

    info(...args)
    {
        const level = "info";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    verbose(...args)
    {
        const level = "verbose";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    warn(...args)
    {
        const level = "warn";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    error(...args)
    {
        const level = "error";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    startTime(...args)
    {
        const level = "startTime";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    endTime(...args)
    {
        const level = "endTime";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    uncaught(...args)
    {
        const level = "uncaught";
        const context = this._getContext();
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(this._initiator, level, context, args);
        });
    }

    _logConsole(initiator, level, context, args)
    {
        const dateTime = moment().format("DD-MM-YYYY HH:mm:ss");
        switch (level)
        {
        case "uncaught":
        case "error":
            console.error(dateTime + " [" + initiator + "]", ...args);
            break;
        case "warn":
            console.warn(dateTime + " [" + initiator + "]", ...args);
            break;
        case "info":
            console.info(dateTime + " [" + initiator + "]", ...args);
            break;
        case "verbose":
        case "debug":
            console.debug(dateTime + " [" + initiator + "]", ...args);
            break;
        case "startTime":
            console.time(...args);
            break;
        case "endTime":
            console.timeEnd(...args);
            break;
        default:
            console.log(dateTime + " [" + initiator + "]", ...args);
            break;
        }
    }

    _getContext()
    {
        try
        {
            throw Error("");
        }
        catch (err)
        {
            let line = err.stack.split("\n")[4];
            let index = line ? line.indexOf("at ") : "unknown";
            let clean = line ? line.slice(index + 2, line.length)
                .trim() : "unknown";
            return {
                line,
                index,
                clean,
                "stack": err.stack
            };
        }
    }
}
