import Talker from "../libs/talker.cjs";
import Events from "./eventtarget.js";

/**
 * wrapper for talkerapi to communicate ui <-> backend even in iframed setups
 *
 * @name TalkerAPI
 * @extends {Events}
 */
export default class TalkerAPI extends Events
{
    constructor(target)
    {
        super();

        // eslint-disable-next-line no-undef
        this._talker = new Talker.default(target, "*");
        this._callbackCounter = 0;
        this._callbacks = {};

        this._talker.onMessage = (msg) =>
        {
            if (msg.data && msg.data.cmd) // other messages are not for talkerapi, i.e. anything that somehow is sent via .postMessage
            {
                if (msg.data.cmd === "callback")
                {
                    if (this._callbacks[msg.data.cb]) this._callbacks[msg.data.cb](msg.data.error, msg.data.response);
                }
                else
                {
                    if (!this.hasListenerForEventName(msg.data.cmd))
                    {
                        console.error("TalkerAPI has no listener for", msg.data.cmd);
                    }
                    this.emitEvent(msg.data.cmd, msg.data.data, (error, r) =>
                    {
                        this._talker.send("cables", { "cmd": "callback", "cb": msg.data.cb, "response": r, "error": error });
                    });
                }
            }
        };
    }

    /**
     * send message via cables-talkerapi
     * @param {string} cmd name of the event
     * @param {any[]} data payload
     * @param {function} cb callback
     */
    send(cmd, data, cb)
    {
        const payload = { "cmd": cmd, "data": data };
        if (cb)
        {
            this._callbackCounter++;
            this._callbacks[this._callbackCounter] = cb;
            payload.cb = this._callbackCounter;
        }

        this._talker.send("cables", payload);
    }
}
