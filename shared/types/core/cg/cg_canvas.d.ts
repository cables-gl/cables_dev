export class CgCanvas {
    constructor(options: any);
    _log: Logger;
    _canvasEle: any;
    _cg: any;
    pixelDensity: number;
    canvasWidth: any;
    canvasHeight: any;
    _oldWidthRp: number;
    _oldHeightRp: number;
    get canvasEle(): any;
    /**
     * @param {Number} w
     * @param {Number} h
     * @param {any} ignorestyle
     * @returns {any}
     */
    setSize(w: number, h: number, ignorestyle?: any): any;
    updateSize(): void;
    dispose(): void;
}
import { Logger } from "cables-shared-client/index.js";
