/** @typedef GPUBufferOptions
 * @property {number} length
 * @property {GPUBufferDescriptor} [buffCfg]
*/
export class CgpGguBuffer extends Events {
    static BINDINGTYPE_STORAGE: string;
    static BINDINGTYPE_UNIFORM: string;
    static BINDINGTYPE_READONLY_STORAGE: string;
    /**
     * Description
     * @param {CgpContext} cgp
     * @param {String} name
     * @param {Array} data=null
     * @param {GPUBufferOptions} options={}
     */
    constructor(cgp: CgpContext, name: string, data?: any[], options?: GPUBufferOptions);
    /** @type {GPUBufferDescriptor} */
    buffCfg: GPUBufferDescriptor;
    id: string;
    floatArr: any;
    needsUpdate: boolean;
    /**
     * @param {Array} arr
     */
    setData(arr: any[]): void;
    /**
     * @param {number} s
     */
    setLength(s: number): void;
    /** @param {CgpContext} cgp */
    updateGpuBuffer(cgp?: CgpContext): void;
    get name(): string;
    /** @returns {GPUBuffer} */
    get gpuBuffer(): GPUBuffer;
    get length(): number;
    getSizeBytes(): number;
    dispose(): void;
    #private;
}
export type GPUBufferOptions = {
    length: number;
    buffCfg?: GPUBufferDescriptor;
};
import { Events } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";
