export namespace ANIM {
    export { Key };
}
/**
 * Keyframed interpolated animation.
 *
 * Available Easings:
 * <code>
 * CONSTANTS.ANIM.EASING_LINEAR
 * CONSTANTS.ANIM.EASING_ABSOLUTE
 * CONSTANTS.ANIM.EASING_SMOOTHSTEP
 * CONSTANTS.ANIM.EASING_SMOOTHERSTEP
 * CONSTANTS.ANIM.EASING_CUBICSPLINE

 * CONSTANTS.ANIM.EASING_CUBIC_IN
 * CONSTANTS.ANIM.EASING_CUBIC_OUT
 * CONSTANTS.ANIM.EASING_CUBIC_INOUT

 * CONSTANTS.ANIM.EASING_EXPO_IN
 * CONSTANTS.ANIM.EASING_EXPO_OUT
 * CONSTANTS.ANIM.EASING_EXPO_INOUT

 * CONSTANTS.ANIM.EASING_SIN_IN
 * CONSTANTS.ANIM.EASING_SIN_OUT
 * CONSTANTS.ANIM.EASING_SIN_INOUT

 * CONSTANTS.ANIM.EASING_BACK_IN
 * CONSTANTS.ANIM.EASING_BACK_OUT
 * CONSTANTS.ANIM.EASING_BACK_INOUT

 * CONSTANTS.ANIM.EASING_ELASTIC_IN
 * CONSTANTS.ANIM.EASING_ELASTIC_OUT

 * CONSTANTS.ANIM.EASING_BOUNCE_IN
 * CONSTANTS.ANIM.EASING_BOUNCE_OUT

 * CONSTANTS.ANIM.EASING_QUART_IN
 * CONSTANTS.ANIM.EASING_QUART_OUT
 * CONSTANTS.ANIM.EASING_QUART_INOUT

 * CONSTANTS.ANIM.EASING_QUINT_IN
 * CONSTANTS.ANIM.EASING_QUINT_OUT
 * CONSTANTS.ANIM.EASING_QUINT_INOUT
 * </code>
 * @class
 * @param cfg
 * @example
 * var anim=new CABLES.Anim();
 * anim.setValue(0,0);  // set value 0 at 0 seconds
 * anim.setValue(10,1); // set value 1 at 10 seconds
 * anim.getValue(5);    // get value at 5 seconds - this returns 0.5
 */
export class Anim extends Events {
    constructor(cfg: any);
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
    isRising(time: any): boolean;
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
    getLength(): any;
    getKeyIndex(time: any): number;
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
    setKeyEasing(index: any, e: any): void;
    getSerialized(): {
        keys: any[];
        loop: boolean;
    };
    getKey(time: any): any;
    getNextKey(time: any): any;
    isFinished(time: any): boolean;
    isStarted(time: any): boolean;
    remove(k: any): void;
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
    addKey(k: any): void;
    easingFromString(str: any): number;
    createPort(op: any, title: any, cb: any): any;
}
export namespace Anim {
    function slerpQuaternion(time: any, q: any, animx: any, animy: any, animz: any, animw: any): any;
}
import { Key } from "./anim_key.js";
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
