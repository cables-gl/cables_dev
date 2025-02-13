export default PatchVariable;
declare class PatchVariable extends Events {
    /**
     * @param {String} name
     * @param {String|Number} val
     * @param {number} type
     */
    constructor(name: string, val: string | number, type: number);
    _name: string;
    type: number;
    /**
     * keeping this for backwards compatibility in older
     * exports before using eventtarget
     *
     * @param cb
     */
    addListener(cb: any): void;
    /**
     * @function Variable.getValue
     * @memberof PatchVariable
     * @returns {String|Number|Boolean}
     */
    getValue(): string | number | boolean;
    /**
     * @function getName
     * @memberof PatchVariable
     * @instance
     * @returns {String|Number|Boolean}
     * @function
     */
    getName(): string | number | boolean;
    /**
     * @function setValue
     * @memberof PatchVariable
     * @instance
     * @param v
     * @returns {any}
     * @function
     */
    setValue(v: any): any;
    _v: any;
}
import { Events } from "cables-shared-client";
