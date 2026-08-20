/* eslint-disable no-console */
export default class Logger
{

    /**
     * @param {any} initiator
     * @param {Object} options
     */
    constructor(initiator, options)
    {
        this.initiator = initiator;
        this._options = options;
        if (!this.initiator)
        {
            console.error("no log initator given");
            CABLES.logStack();
        }
    }

    /**
     * @param {string} t
     */
    stack(t)
    {
        console.info("[" + this.initiator + "] ", t);
        console.log((new Error()).stack);
    }

    /**
     * @param {string} t
     */
    groupCollapsed(t)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent) console.log("[" + this.initiator + "]", ...arguments);

        console.groupCollapsed("[" + this.initiator + "] " + t);
    }

    /* minimalcore:start */
    /**
     * @param {any[][]} t
     */
    table(t)
    {
        console.table(t);
    }

    groupEnd()
    {
        console.groupEnd();
    }

    /* minimalcore:end */

    error()
    {

        /* minimalcore:start */
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 2 }, ...arguments)) || !CABLES.UI)
        {

            /* minimalcore:end */
            console.error("[" + this.initiator + "]", ...arguments);

        /* minimalcore:start */
        }

        if (this._options && this._options.onError)
        {

            /* minimalcore:end */
            this._options.onError(this.initiator, ...arguments);

        /* minimalcore:start */
        }

        /* minimalcore:end */

    }

    errorGui()
    {

        /* minimalcore:start */
        if (CABLES.UI) CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 2 }, ...arguments);

        /* minimalcore:end */
    }

    warn()
    {

        /* minimalcore:start */
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 1 }, ...arguments)))
            console.warn("[" + this.initiator + "]", ...arguments);
        return null;

        /* minimalcore:end */
    }

    verbose()
    {

        /* minimalcore:start */
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);

        /* minimalcore:end */
    }

    info()
    {

        /* minimalcore:start */
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.info("[" + this.initiator + "]", ...arguments);

        /* minimalcore:end */
    }

    log()
    {

        /* minimalcore:start */
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);

        /* minimalcore:end */
    }

    logGui()
    {

        /* minimalcore:start */
        if (CABLES.UI) CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments);

        /* minimalcore:end */
    }

    userInteraction(text)
    {
        // this.log({ "initiator": "userinteraction", "text": text });
    }
}
