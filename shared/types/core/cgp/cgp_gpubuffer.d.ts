/** GPUBuffer */
export default class GPUBuffer extends Events {
    /**
     * Description
     * @param {WebGpuContext} cgp
     * @param {String} name
     * @param {Array} data=null
     * @param {Object} options={}
     */
    constructor(cgp: WebGpuContext, name: string, data?: any[], options?: any);
    id: any;
    floatArr: any;
    needsUpdate: boolean;
    presentationFormat: any;
    _buffCfg: any;
    /**
     * @param {Array} arr
     */
    setData(arr: any[]): void;
    /**
     * @param {number} s
     */
    setLength(s: number): void;
    updateGpuBuffer(cgp: any): void;
    _cgp: any;
    get name(): string;
    get gpuBuffer(): any;
    get length(): number;
    getSizeBytes(): number;
    dispose(): void;
    #private;
}
import { Events } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";
