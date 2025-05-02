export class Listener
{

    /**
     * @param {Object} emitter
     * @param {string} id
     * @param {string} eventName
     */
    constructor(emitter, id, eventName)
    {
        this.targetObj = emitter;
        this.id = id;
        this.eventName = eventName;
    }

    stop()
    {
        this.targetObj.off(this.id);
    }
}
