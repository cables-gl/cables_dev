export class CgCanvas {
    constructor(options: any);
    _canvasEle: any;
    _cg: any;
    pixelDensity: number;
    canvasWidth: any;
    canvasHeight: any;
    _oldWidthRp: number;
    _oldHeightRp: number;
    get canvasEle(): any;
    setSize(w: any, h: any, ignorestyle: any): void;
    updateSize(): void;
    dispose(): void;
}
