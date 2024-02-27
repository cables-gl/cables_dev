import moment from "moment";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
/* eslint-disable no-console */
export default class SharedLogger extends SharedUtil
{
    get utilName()
    {
        return UtilProvider.LOGGER;
    }

    get _initiator()
    {
        return this.constructor.name || "logger";
    }

    /**
     * @param args
     *  @abstract
     */
    debug(...args) {}

    /**
     * @param args
     *  @abstract
     */
    info(...args) {}

    /**
     * @param args
     *  @abstract
     */
    verbose(...args) {}

    /**
     * @param args
     *  @abstract
     */
    warn(...args) {}

    /**
     * @param args
     *  @abstract
     */
    error(...args) {}

    /**
     * @param args
     *  @abstract
     */
    startTime(...args) {}

    /**
     * @param args
     *  @abstract
     */
    endTime(...args) {}

    /**
     * @param args
     * @abstract
     */
    uncaught(...args) {}

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
