export function internalNow(): number;
export function now(): number;
/**
 * Measuring time
 * @namespace external:CABLES#Timer
 * @hideconstructor
 * @class
 */
export class Timer extends Events {
    /**
     * @private
     */
    private _timeStart;
    _timeOffset: number;
    _currentTime: number;
    _lastTime: number;
    _paused: boolean;
    _delay: number;
    overwriteTime: number;
    _internalNow(): any;
    _getTime(): number;
    setDelay(d: any): void;
    /**
     * @function
     * @memberof Timer
     * @instance
     * @description returns true if timer is playing
     * @return {Boolean} value
     */
    isPlaying(): boolean;
    /**
     * @function
     * @memberof Timer
     * @instance
     * @param ts
     * @description update timer
     * @return {Number} time
     */
    update(ts: any): number;
    _ts: any;
    /**
     * @function
     * @memberof Timer
     * @instance
     * @return {Number} time in milliseconds
     */
    getMillis(): number;
    /**
     * @function
     * @memberof Timer
     * @instance
     * @return {Number} value time in seconds
     */
    get(): number;
    getTime(): number;
    /**
     * toggle between play/pause state
     * @function
     * @memberof Timer
     * @instance
     */
    togglePlay(): void;
    /**
     * set current time
     * @function
     * @memberof Timer
     * @instance
     * @param {Number} t
     */
    setTime(t: number): void;
    setOffset(val: any): void;
    /**
     * (re)starts the timer
     * @function
     * @memberof Timer
     * @instance
     */
    play(): void;
    /**
     * pauses the timer
     * @function
     * @memberof Timer
     * @instance
     */
    pause(): void;
}
import { Events } from "cables-shared-client";
