import moment from "moment-mini";
import path from "path";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";
import cables from "../cables.js";

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

        this._levels = [
            "debug",
            "verbose",
            "info",
            "warn",
            "error",
            "uncaught"
        ];

        this._logLevel = this._cables.getLogLevel();
        this._logLevelIndex = this._levels.findIndex((level) => { return level == this._logLevel; });

        // register console output, will include "verbose"
        this._services.push({
            "name": "console",
            "levels": ["debug", "verbose", "info", "warn", "error", "uncaught", "startTime", "endTime"],
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
        const initiator = this._getCallerFile();
        return initiator || "logger";
    }

    _log(...args)
    {
        this.info(...args);
    }

    debug(...args)
    {
        const level = "debug";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    verbose(...args)
    {
        const level = "verbose";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    info(...args)
    {
        const level = "info";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    warn(...args)
    {
        const level = "warn";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    error(...args)
    {
        const level = "error";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    uncaught(...args)
    {
        const level = "uncaught";
        if (this._logLevelFiltered(level)) return;
        const initiator = this._initiator;
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    startTime(...args)
    {
        const initiator = this._initiator;
        const level = "startTime";
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    endTime(...args)
    {
        const initiator = this._initiator;
        const level = "endTime";
        const context = this._getContext(args);
        const loggers = this._services.filter((s) => { return s.levels.includes(level); });
        loggers.forEach((l) =>
        {
            l.log(initiator, level, context, args);
        });
    }

    _logConsole(initiator, level, context, args, dateFormat = "DD-MM-YYYY HH:mm:ss", shortFormat = false)
    {
        let dateTime = moment().format(dateFormat);
        if (shortFormat || (this._cables && this._cables.isLocal()))
        {
            dateTime = "[" + moment().format("HH:mm:ss") + "]";
        }

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

    _getContext(loggerArguments)
    {
        try
        {
            let err = new Error();
            if (loggerArguments)
            {
                for (let i = 0; i < loggerArguments.length; i++)
                {
                    const arg = loggerArguments[i];
                    if (arg.hasOwnProperty("stack"))
                    {
                        err = arg;
                        break;
                    }
                }
            }

            let line = err.stack.split("\n")[4];
            let index = line ? line.indexOf("at ") : "unknown";
            let clean = line ? line.slice(index + 2, line.length).trim() : "unknown";
            return {
                line,
                index,
                clean,
                "stack": err.stack
            };
        }
        catch (err) {}
    }

    _getCallerFile()
    {
        let originalFunc = Error.prepareStackTrace;

        let callerFile = null;
        let currentFileLine = null;
        try
        {
            let err = new Error();

            Error.prepareStackTrace = (_err, stack) => { return stack; };
            let currentFileName = err.stack.shift().getFileName();
            while (err.stack.length)
            {
                const stack = err.stack.shift();
                callerFile = stack.getFileName();
                currentFileLine = stack.getLineNumber();
                if (currentFileName !== callerFile && !callerFile.includes("logger.js")) break;
            }
        }
        catch (e) {}
        Error.prepareStackTrace = originalFunc;
        let result = "logger";
        if (callerFile)
        {
            result = path.basename(callerFile, ".js");
            if (currentFileLine) result += ":" + currentFileLine;
        }
        return result;
    }

    _logLevelFiltered(logLevel)
    {
        if (!logLevel) return false;
        if (!this._logLevel) return false;
        if (this._logLevelIndex < 0) return false;
        const levelIndex = this._levels.findIndex((level) => { return level === logLevel; });
        if (levelIndex < 0) return false;
        return this._logLevelIndex > levelIndex;
    }
}
