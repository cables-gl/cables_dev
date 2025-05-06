export class EventListener
{

    /**
     * @param {Object} emitter
     * @param {string} id
     * @param {string} eventName
     * @param {Function} cb
     */
    constructor(emitter, id, eventName, cb)
    {
        this.targetObj = emitter;
        this.id = id;
        this.eventName = eventName;
        this.cb = cb;
    }

    remove()
    {
        this.targetObj.off(this.id);
    }
}
