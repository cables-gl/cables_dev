import { EventListener } from "./eventlistener.js";
import helper from "./helper.js";
import Logger from "./logger.js";

/**
 * add eventlistener functionality to classes
 */
export default class Events
{
    #eventLog = new Logger("eventtarget");

    /** @type {Object<string,EventListener>} */
    #listeners = {};
    #logEvents = false;
    #logName = "";
    #eventCallbacks = {};
    #countErrorUnknowns = 0;
    eventsPaused = false;

    constructor()
    {
    }

    /**
     * @callback whatever
     * @param {...any} param
     */

    /**
     * add event listener
     * @param {string} eventName event name
     * @param {whatever} cb callback
     * @param {string} idPrefix prefix for id, default empty
     * @return {EventListener} eventlistener
     */
    on(eventName, cb, idPrefix = "")
    {
        const newId = (idPrefix || "") + helper.simpleId();

        const event = new EventListener(this, newId, eventName, cb);

        if (!this.#eventCallbacks[eventName]) this.#eventCallbacks[eventName] = [event];
        else this.#eventCallbacks[eventName].push(event);

        this.#listeners[event.id] = event;

        return event;
    }

    removeAllEventListeners()
    {
        for (const i in this.#listeners)
        {
            this.off(this.#listeners[i]);
        }
    }

    /**
     *
     * @param {string} which
     * @param {whatever} cb
     */
    addEventListener(which, cb, idPrefix = "")
    {
        return this.on(which, cb, idPrefix);
    }

    /**
     * check event listener registration
     * @param {string|EventListener} id event id
     * @param {whatever} cb callback - deprecated
     * @return {boolean}
     */
    hasEventListener(id, cb = null)
    {
        if (id && !cb)
        {
            if (typeof id == "string") // check by id
                return !!this.#listeners[id];
            else
                return !!this.#listeners[id.id];

        }
        else
        {
            this.#eventLog.warn("old eventtarget function haseventlistener!");
            if (id && cb)
            {
                if (this.#eventCallbacks[id])
                {
                    const idx = this.#eventCallbacks[id].indexOf(cb);
                    return idx !== -1;
                }
            }
        }
    }

    /**
     * check event listener by name
     * @param {string } eventName event name
     * @return {boolean}
     */
    hasListenerForEventName(eventName)
    {
        return this.#eventCallbacks[eventName] && this.#eventCallbacks[eventName].length > 0;
    }

    /** @deprecated */
    removeEventListener(id)
    {
        return this.off(id);
    }

    /**
     * remove event listener registration
     * @param {EventListener} listenerParam
     */
    off(listenerParam)
    {
        if (listenerParam === null || listenerParam === undefined)
        {
            this.#eventLog.warn("removeEventListener id null", listenerParam);
            return;
        }

        let id = listenerParam; // old off was using id strings directly, now uses eventlistener class
        // @ts-ignore
        if (listenerParam.eventName) id = listenerParam.id;

        if (typeof id != "string")
        {
            console.log("old function signature: removeEventListener! use listener id");
            return;
        }

        const event = this.#listeners[id];
        if (!event)
        {
            if (this.#countErrorUnknowns == 20) this.#eventLog.warn("stopped reporting unknown events");
            if (this.#countErrorUnknowns < 20) this.#eventLog.warn("could not find event...", id, event);
            this.#countErrorUnknowns++;
            return;
        }

        let removeCount = 0;

        let found = true;
        while (found)
        {
            found = false;
            let index = -1;
            for (let i = 0; i < this.#eventCallbacks[event.eventName].length; i++)
            {
                if (this.#eventCallbacks[event.eventName][i].id.indexOf(id) === 0) // this._eventCallbacks[event.eventName][i].id == which ||
                {
                    found = true;
                    index = i;
                }
            }

            if (index !== -1)
            {
                this.#eventCallbacks[event.eventName].splice(index, 1);
                delete this.#listeners[id];
                removeCount++;
            }
        }

        if (removeCount == 0)console.log("no events removed", event.eventName, id);

        return;
    }

    /**
     * enable/disable logging of events for the class
     *
     * @param {boolean} enabled
     * @param {string} logName
     */
    logEvents(enabled, logName)
    {
        this.#logEvents = enabled;
        this.#logName = logName;
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
        if (this.eventsPaused) return;
        if (this.#logEvents) this.#eventLog.log("[event] ", this.#logName, which, this.#eventCallbacks);

        if (this.#eventCallbacks[which])
        {
            for (let i = 0; i < this.#eventCallbacks[which].length; i++)
            {
                if (this.#eventCallbacks[which][i])
                {
                    this.#eventCallbacks[which][i].cb(param1, param2, param3, param4, param5, param6, param7, param8);
                }
            }
        }
        else
        {
            if (this.#logEvents) this.#eventLog.log("[event] has no event callback", which, this.#eventCallbacks);
        }
    }
}
