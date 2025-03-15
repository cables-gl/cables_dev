export class AnimKey {
    constructor(obj: any, an: any);
    id: string;
    time: number;
    value: number;
    selected: boolean;
    anim: any;
    onChange: any;
    _easing: number;
    cb: any;
    cbTriggered: boolean;
    delete(): void;
    /**
     * @param {Number} e
     */
    setEasing(e: number): void;
    ease: ((perc: any, key2: any) => number) | ((perc: any, key2: any) => any) | ((perc: any, key2: any) => number) | ((perc: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((t: any, key2: any) => number) | ((perc: any, key2: any) => number);
    trigger(): void;
    setValue(v: any): void;
    set(obj: any): void;
    /**
   * @returns {Object}
   */
    getSerialized(): any;
    getEasing(): number;
}
export namespace AnimKey {
    function cubicSpline(perc: any, key1: any, key2: any): number;
    function easeCubicSpline(perc: any, key2: any): number;
    function linear(perc: any, key1: any, key2: any): number;
    function easeLinear(perc: any, key2: any): number;
    function easeAbsolute(perc: any, key2: any): any;
    function easeExpoIn(t: any, key2: any): number;
    function easeExpoOut(t: any, key2: any): number;
    function easeExpoInOut(t: any, key2: any): number;
    function easeSinIn(t: any, key2: any): number;
    function easeSinOut(t: any, key2: any): number;
    function easeSinInOut(t: any, key2: any): number;
    function easeCubicIn(t: any, key2: any): number;
    function easeInQuint(t: any, key2: any): number;
    function easeOutQuint(t: any, key2: any): number;
    function easeInOutQuint(t: any, key2: any): number;
    function easeInQuart(t: any, key2: any): number;
    function easeOutQuart(t: any, key2: any): number;
    function easeInOutQuart(t: any, key2: any): number;
    function bounce(t: any): any;
    function easeInBounce(t: any, key2: any): number;
    function easeOutBounce(t: any, key2: any): number;
    function easeInElastic(t: any, key2: any): number;
    function easeOutElastic(t: any, key2: any): number;
    function easeInBack(t: any, key2: any): number;
    function easeOutBack(t: any, key2: any): number;
    function easeInOutBack(t: any, key2: any): number;
    function easeCubicOut(t: any, key2: any): number;
    function easeCubicInOut(t: any, key2: any): number;
    function easeSmoothStep(perc: any, key2: any): number;
    function easeSmootherStep(perc: any, key2: any): number;
}
export function easeExpoIn(t: any): number;
export function easeExpoOut(t: any): any;
export function easeExpoInOut(t: any): any;
export function easeCubicIn(t: any): any;
export function easeCubicOut(t: any): any;
export function easeCubicInOut(t: any): any;
