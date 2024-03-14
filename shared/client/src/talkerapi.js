import Talker from "../libs/talker.cjs";
import Events from "./eventtarget.js";


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
            if (msg.data.cmd === "callback")
            {
                if (this._callbacks[msg.data.cb]) this._callbacks[msg.data.cb](msg.data.error, msg.data.response);
            }
            else
            {
                if (!this.hasListenerForEventName(msg.data.cmd))
                {
                    console.error("TalkerAPI in api has no listener for", msg.data.cmd);
                }
                this.emitEvent(msg.data.cmd, msg.data.data, (error, r) =>
                {
                    this._talker.send("cables", { "cmd": "callback", "cb": msg.data.cb, "response": r, "error": error });
                });
            }
        };
    }

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
