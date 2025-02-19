export default class Binding {
    /**
     * Description
     * @param {CgpContext} cgp
     * @param {String} name
     * @param {Object} options={}
     */
    constructor(cgp: WebGpuContext, name: string, options?: any);
    /** @type {Array<Uniform>} */
    uniforms: Array<Uniform>;
    /** @type {Array<GPUBuffer>} */
    cGpuBuffers: Array<GPUBuffer>;
    /** @type {Shader} */
    shader: Shader;
    bindingInstances: any[];
    stageStr: string;
    bindingType: string;
    isValid: boolean;
    changed: number;
    define: string;
    _log: Logger;
    stage: any;
    isStruct(): boolean;
    /**
     * @param {Shader} newShader
     * @returns {Binding}
     */
    copy(newShader: Shader): Binding;
    /**
     * @param {Uniform} uni
     */
    addUniform(uni: Uniform): void;
    getSizeBytes(): number;
    getShaderHeaderCode(): string;
    getBindingGroupLayoutEntry(): {
        label: string;
        binding: number;
        visibility: any;
        size: number;
    };
    get isActive(): boolean;
    /**
     * @param {number} inst
     */
    getBindingGroupEntry(inst: number): {
        label: string;
        binding: number;
        size: number;
        visibility: any;
    };
    _createCgpuBuffer(inst: any): void;
    /**
     * @param {CgpContext} cgp
     * @param {Number} bindingIndex
     */
    update(cgp: WebGpuContext, bindingIndex: number): void;
    #private;
}
import Uniform from "./cgp_uniform.js";
import GPUBuffer from "./cgp_gpubuffer.js";
import Shader from "./cgp_shader.js";
import { Logger } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";
