export default class WebGpuCanvasAttachment {
    /**
     * @param {WebGpuContext} cgp
     */
    constructor(cgp: WebGpuContext);
    get canvas(): canvas;
    /**
     * @param {function} cb
     */
    render(cb: Function): void;
    #private;
}
import { WebGpuContext } from "./cgp_state.js";
