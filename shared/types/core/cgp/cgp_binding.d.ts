/**
     * @typedef CgpBindingOptions
     * @property {string} bindingType  "uniform", "storage", "read-only-storage","read-write-storage",
     * @property {string} [define]
     * @property {CgpShader} shader
     * @property {number} stage
     * @property {number} index
     */
export class Binding {
    /**
     * Description
     * @param {CgpContext} cgp
     * @param {String} name
     * @param {CgpBindingOptions} [options]
     */
    constructor(cgp: CgpContext, name: string, options?: CgpBindingOptions);
    /** @type {Array<CgpUniform>} */
    uniforms: Array<CgpUniform>;
    /** @type {Array<CgpGguBuffer>} */
    cGpuBuffers: Array<CgpGguBuffer>;
    /** @type {Array<GPUBindGroupEntry>} */
    bindingInstances: Array<GPUBindGroupEntry>;
    bindingType: string;
    isValid: boolean;
    changed: number;
    define: string;
    _log: Logger;
    stage: number;
    getStageString(): "unknown" | "fragment" | "vertex" | "compute";
    getInfo(): {
        class: any;
        name: string;
        id: number;
        stage: string;
        bindingType: string;
        numUniforms: number;
        bindingIndex: number;
        numInstances: number;
    };
    getBindingIndex(): number;
    isStruct(): boolean;
    /**
     * @param {CgpShader} newShader
     * @returns {Binding}
     */
    copy(newShader: CgpShader): Binding;
    /**
     * @param {CgpUniform} uni
     */
    addUniform(uni: CgpUniform): void;
    getSizeBytes(): number;
    getShaderHeaderCode(): string;
    /** @returns {GPUBindGroupLayoutEntry} */
    getBindingGroupLayoutEntry(): GPUBindGroupLayoutEntry;
    get isActive(): boolean;
    /**
     * @param {number} inst
     * @returns {GPUBindGroupEntry}
     */
    getBindingGroupEntry(inst: number): GPUBindGroupEntry;
    /**
     * @param {any} inst
     */
    _createCgpuBuffer(inst: any): void;
    /**
     * @param {Number} inst
     */
    update(inst: number): void;
    #private;
}
export type CgpBindingOptions = {
    /**
     * "uniform", "storage", "read-only-storage","read-write-storage",
     */
    bindingType: string;
    define?: string;
    shader: CgpShader;
    stage: number;
    index: number;
};
import { CgpUniform } from "./cgp_uniform.js";
import { CgpGguBuffer } from "./cgp_gpubuffer.js";
import { Logger } from "cables-shared-client";
import { CgpShader } from "./cgp_shader.js";
import { CgpContext } from "./cgp_state.js";
