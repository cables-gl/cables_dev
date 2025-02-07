/**
 * @namespace CGL
 */
/**
 * multiply to get radians from degree, e.g. `360 * CGL.DEG2RAD`
 * @const {Number}
 * @memberof CGL
 * @static
 */
export const DEG2RAD: number;
/**
 * to get degrees from radians, e.g. `3.14 * CGL.RAD2DEG`
 * @const {number}
 * @memberof CGL
 */
export const RAD2DEG: number;
export const onLoadingAssetsFinished: any;
/**
 * get normalized mouse wheel delta (including browser specific adjustment)
 * @function getWheelDelta
 * @static
 * @memberof CGL
 * @param {MouseEvent} event
 * @return {Number} normalized delta
 */
export const isWindows: any;
export function getWheelSpeed(event: any): number;
export function getWheelDelta(event: any): number;
export function escapeHTML(string: any): any;
