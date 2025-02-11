export function easeExpoIn(t: any): number;
export function easeExpoOut(t: any): any;
export function easeExpoInOut(t: any): any;
export function easeCubicIn(t: any): any;
export function easeCubicOut(t: any): any;
export function easeCubicInOut(t: any): any;
export class Key {
    constructor(obj: any);
    time: number;
    value: number;
    selected: boolean;
    onChange: any;
    _easing: number;
    cb: any;
    cbTriggered: boolean;
    setEasing(e: any): void;
    ease: any;
    trigger(): void;
    setValue(v: any): void;
    set(obj: any): void;
    getSerialized(): {
        t: number;
        v: number;
        e: number;
    };
    getEasing(): number;
}
export namespace Key {
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
