import helper from "./helper.js";
import Logger from "./logger.js";

/**
 * add eventlistener functionality to classes
 */
export default class Events
{
    #eventLog;
    constructor()
    {
        this.#eventLog = new Logger("eventtarget");
        this._eventCallbacks = {};
        this._logName = "";
        this._logEvents = false;
        this._listeners = {};

        this._countErrorUnknowns = 0;
    }

    /**
     * add event listener
     * @param {string} which event name
     * @param {function} cb callback
     * @param {string} idPrefix prefix for id, default empty
     * @return {string} event id
     */
    on(which, cb, idPrefix = "")
    {
        const event =
            {
                "id": (idPrefix || "") + helper.simpleId(),
                "name": which,
                "cb": cb,
            };
        if (!this._eventCallbacks[which]) this._eventCallbacks[which] = [event];
        else this._eventCallbacks[which].push(event);

        this._listeners[event.id] = event;

        return event.id;
    }

    /**
     * @param {string} which
     * @param {Function} cb
     */
    listen(which, cb, idPrefix = "")
    {

        const id = this.on(which, cb, idPrefix);

        return { "stop": () =>
        {
            console.log("remove!!!");
            this.off(id);
        }
        };
    }

    /** @deprecated */
    addEventListener(which, cb, idPrefix = "")
    {
        return this.on(which, cb, idPrefix);
    }

    /**
     * check event listener registration
     * @param {string} id event id
     * @param {function} cb callback - deprecated
     * @return {boolean}
     */
    hasEventListener(id, cb = null)
    {
        if (id && !cb)
        {
            // check by id
            return !!this._listeners[id];
        }
        else
        {
            this.#eventLog.warn("old eventtarget function haseventlistener!");
            if (id && cb)
            {
                if (this._eventCallbacks[id])
                {
                    const idx = this._eventCallbacks[id].indexOf(cb);
                    return idx !== -1;
                }
            }
        }
    }

    /**
     * check event listener by name
     * @param eventName event name
     * @return {boolean}
     */
    hasListenerForEventName(eventName)
    {
        return this._eventCallbacks[eventName] && this._eventCallbacks[eventName].length > 0;
    }

    /** @deprecated */
    removeEventListener(id)
    {
        return this.off(id);
    }

    /**
     * remove event listener registration
     * @param {string} id event id
     * @return
     */
    off(id)
    {
        if (id === null || id === undefined)
        {
            this.#eventLog.warn("removeEventListener id null", id);
            return;
        }

        if (typeof id == "string") // new style, remove by id, not by name/callback
        {
            const event = this._listeners[id];
            if (!event)
            {
                if (this._countErrorUnknowns == 20) this.#eventLog.warn("stopped reporting unknown events");
                if (this._countErrorUnknowns < 20) this.#eventLog.warn("could not find event...", id);
                this._countErrorUnknowns++;
                return;
            }

            let removeCount = 0;

            let found = true;
            while (found)
            {
                found = false;
                let index = -1;
                for (let i = 0; i < this._eventCallbacks[event.name].length; i++)
                {
                    if (this._eventCallbacks[event.name][i].id.indexOf(id) === 0) // this._eventCallbacks[event.name][i].id == which ||
                    {
                        found = true;
                        index = i;
                    }
                }

                if (index !== -1)
                {
                    this._eventCallbacks[event.name].splice(index, 1);
                    delete this._listeners[id];
                    removeCount++;
                }
            }

            if (removeCount == 0)console.log("no events removed", event.name, id);

            return;
        }
        else
        {
            console.log("old function signature: removeEventListener! use listener id");
        }
    }

    /**
     * enable/disable logging of events for the class
     *
     * @param {boolean} enabled
     * @param {string} logName
     */
    logEvents(enabled, logName)
    {
        this._logEvents = enabled;
        this._logName = logName;
    }

    /**
     * emit event
     *
     * @param {string} which event name
     * @param {*} param1
     * @param {*} param2
     * @param {*} param3
     * @param {*} param4
     * @param {*} param5
     * @param {*} param6
     */
    emitEvent(which, param1 = null, param2 = null, param3 = null, param4 = null, param5 = null, param6 = null, param7 = null, param8 = null)
    {
        if (this._logEvents) this.#eventLog.log("[event] ", this._logName, which, this._eventCallbacks);

        if (this._eventCallbacks[which])
        {
            for (let i = 0; i < this._eventCallbacks[which].length; i++)
            {
                if (this._eventCallbacks[which][i])
                {
                    this._eventCallbacks[which][i].cb(param1, param2, param3, param4, param5, param6, param7, param8);
                }
            }
        }
        else
        {
            if (this._logEvents) this.#eventLog.log("[event] has no event callback", which, this._eventCallbacks);
        }
    }
}
