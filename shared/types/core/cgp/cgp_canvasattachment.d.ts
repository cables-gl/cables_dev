export class WebGpuCanvasAttachment {
    /**
     * @param {CgpContext} cgp
     */
    constructor(cgp: CgpContext);
    get canvas(): canvas;
    /**
     * @param {function} cb
     */
    render(cb: Function): void;
    #private;
}
