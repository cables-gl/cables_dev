/* eslint-disable no-console */

export default class Logger
{
    constructor(initiator)
    {
        this.initiator = initiator;
    }

    stack(t)
    {
        console.info("[" + this.initiator + "] ", t);
        console.log((new Error()).stack);
    }

    groupCollapsed(t)
    {
        console.groupCollapsed("[" + this.initiator + "] " + t);
    }

    table(t)
    {
        console.table(t);
    }

    groupEnd()
    {
        console.groupEnd();
    }

    error(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, 2, ...arguments)) || !CABLES.logSilent)
            console.error("[" + this.initiator + "]", ...arguments);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "error", arguments);
    }

    warn(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, 1, ...arguments)) || !CABLES.logSilent)
            console.warn("[" + this.initiator + "]", ...arguments);
        // console.log((new Error()).stack);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "warn", arguments);
    }

    verbose()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, 0, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "verbose", arguments);
    }

    info(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, 0, ...arguments)) || !CABLES.logSilent)
            console.error("[" + this.initiator + "]", ...arguments);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "info", arguments);
    }


    log(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, 0, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "log", arguments);
    }

    userInteraction(text)
    {
        // this.log({ "initiator": "userinteraction", "text": text });
    }
}
