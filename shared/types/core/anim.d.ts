/**
 * Keyframed interpolated animation.
 *
 * @class
 * @param cfg
 * @example
 * var anim=new CABLES.Anim();
 * anim.setValue(0,0);  // set value 0 at 0 seconds
 * anim.setValue(10,1); // set value 1 at 10 seconds
 * anim.getValue(5);    // get value at 5 seconds - this returns 0.5
 */
declare class Anim extends Events {
    static EASING_LINEAR: number;
    static EASING_ABSOLUTE: number;
    static EASING_SMOOTHSTEP: number;
    static EASING_SMOOTHERSTEP: number;
    static EASING_CUBICSPLINE: number;
    static EASING_CUBIC_IN: number;
    static EASING_CUBIC_OUT: number;
    static EASING_CUBIC_INOUT: number;
    static EASING_EXPO_IN: number;
    static EASING_EXPO_OUT: number;
    static EASING_EXPO_INOUT: number;
    static EASING_SIN_IN: number;
    static EASING_SIN_OUT: number;
    static EASING_SIN_INOUT: number;
    static EASING_BACK_IN: number;
    static EASING_BACK_OUT: number;
    static EASING_BACK_INOUT: number;
    static EASING_ELASTIC_IN: number;
    static EASING_ELASTIC_OUT: number;
    static EASING_BOUNCE_IN: number;
    static EASING_BOUNCE_OUT: number;
    static EASING_QUART_IN: number;
    static EASING_QUART_OUT: number;
    static EASING_QUART_INOUT: number;
    static EASING_QUINT_IN: number;
    static EASING_QUINT_OUT: number;
    static EASING_QUINT_INOUT: number;
    static EASINGNAMES: string[];
    /**
     * @param {object} cfg
     */
    constructor(cfg: object);
    id: string;
    keys: any[];
    onChange: any;
    stayInTimeline: boolean;
    loop: boolean;
    _log: Logger;
    _lastKeyIndex: number;
    _cachedIndex: number;
    name: any;
    /**
     * @member defaultEasing
     * @memberof Anim
     * @instance
     * @type {Number}
     */
    defaultEasing: number;
    onLooped: any;
    _timesLooped: number;
    _needsSort: boolean;
    forceChangeCallback(): void;
    getLoop(): boolean;
    setLoop(target: any): void;
    /**
     * returns true if animation has ended at @time
     * checks if last key time is < time
     * @param {Number} time
     * @returns {Boolean}
     * @memberof Anim
     * @instance
     * @function
     */
    hasEnded(time: number): boolean;
    /**
     * @param {number} time
     */
    isRising(time: number): boolean;
    /**
     * remove all keys from animation before time
     * @param {Number} time
     * @memberof Anim
     * @instance
     * @function
     */
    clearBefore(time: number): void;
    /**
     * remove all keys from animation
     * @param {Number} [time=0] set a new key at time with the old value at time
     * @memberof Anim
     * @instance
     * @function
     */
    clear(time?: number): void;
    sortKeys(): void;
    hasDuplicates(): boolean;
    removeDuplicates(): void;
    getLength(): any;
    /**
     * @param {number} time
     */
    getKeyIndex(time: number): number;
    /**
     * set value at time
     * @function setValue
     * @memberof Anim
     * @instance
     * @param {Number} time
     * @param {Number} value
     * @param {Function} cb callback
     */
    setValue(time: number, value: number, cb?: Function): any;
    /**
     * @param {number} index
     * @param {number} easing
     */
    setKeyEasing(index: number, easing: number): void;
    /**
     * @returns {object}
     */
    getSerialized(): object;
    /**
     * @param {number} time
     */
    getKey(time: number): any;
    /**
     * @param {number} time
     */
    getNextKey(time: number): any;
    /**
     * @param {number} time
     */
    isFinished(time: number): boolean;
    /**
     * @param {number} time
     */
    isStarted(time: number): boolean;
    /**
     * @param {AnimKey} k
     */
    remove(k: AnimKey): void;
    /**
     * get value at time
     * @function getValue
     * @memberof Anim
     * @instance
     * @param {Number} [time] time
     * @returns {Number} interpolated value at time
     */
    getValue(time?: number): number;
    _updateLastIndex(): void;
    /**
     * @param {AnimKey} k
     */
    addKey(k: AnimKey): void;
    /**
     * @param {string} str
     */
    easingFromString(str: string): number;
    /**
     * @param {Op} op
     * @param {string} title
     * @param {function} cb
     * @returns {Port}
     */
    createPort(op: Op, title: string, cb: Function): Port;
}
declare namespace Anim {
    function slerpQuaternion(time: any, q: any, animx: any, animy: any, animz: any, animw: any): any;
}
export default Anim;
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
import AnimKey from "./anim_key.js";
import Op from "./core_op.js";
import Port from "./core_port.js";
