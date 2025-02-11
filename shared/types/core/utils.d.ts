export function cleanJson(obj: any): any;
export function getShortOpName(fullname: string): string;
export function shuffleArray(array: any[] | Float32Array): any[] | Float32Array;
export function shortId(): string;
/**
 * generate a UUID
 * @function uuid
 * @memberof Utils
 * @return {String} generated UUID
 * @static
 */
export function uuid(): string;
/**
 * generate a UUID
 * @function uuid
 * @memberof Utils
 * @return {String} generated UUID
 * @static
 */
export function generateUUID(): string;
/**
 * @see http://stackoverflow.com/q/7616461/940217
 * @memberof Utils
 * @param {string} str
 * @param {string} prefix
 * @return {string}
 */
export function prefixedHash(str: string, prefix?: string): string;
export function simpleId(): number;
export function smoothStep(perc: number): number;
export function smootherStep(perc: number): number;
export function clamp(value: number, min: number, max: number): number;
export function map(x: number, _oldMin: number, _oldMax: number, _newMin: number, _newMax: number, _easing?: number): number;
export function cacheBust(url?: string): string;
export function copyArray(src: any[], dst: any[]): any[];
export function basename(url: string): string;
export function logStack(): void;
export function filename(url: string): string;
export function ajaxSync(url: any, cb: any, method: any, post: any, contenttype: any): void;
export function ajax(url: any, cb: any, method: any, post: any, contenttype: any, jsonP: any, headers?: {}, options?: {}): void;
export function request(options: any): void;
export function keyCodeToName(keyCode: any): any;
export function logErrorConsole(initiator: any, ...args: any[]): void;
export namespace UTILS {
    /**
     * Merge two Float32Arrays.
     * @function float32Concat
     * @memberof Utils
     * @param {Float32Array} first Left-hand side array
     * @param {Float32Array} second Right-hand side array
     * @return {Float32Array}
     * @static
     */
    function float32Concat(first: Float32Array, second: Float32Array): Float32Array;
    /**
     * returns true if parameter is a number
     * @function isNumeric
     * @memberof Utils
     * @param {Any} n value The value to check.
     * @return {Boolean}
     * @static
     */
    function isNumeric(n: Any): boolean;
    /**
     * returns true if parameter is array
     * @function isArray
     * @param {any} v value Value to check
     * @return {Boolean}
     * @static
     */
    function isArray(v: any): boolean;
}
