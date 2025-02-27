export class Pipeline {
    static DEPTH_COMPARE_FUNCS_STRINGS: string[];
    static TYPE_RENDER: number;
    static TYPE_COMPUTE: number;
    /**
     * Description
     * @param {CgpContext} _cgp
     * @param {String} name
     * @param {Number} type
     */
    constructor(_cgp: CgpContext, name: string, type?: number);
    /** @type {GPUBindGroupLayout} */
    bindGroupLayout: GPUBindGroupLayout;
    lastRebuildReason: string;
    rebuildCount: number;
    profile: boolean;
    profiler: any;
    get isValid(): boolean;
    /**
     * @param {String} name
     */
    setName(name: string): void;
    /**
     * @param {CgpShader} oldShader
     * @param {CgpShader} newShader
     */
    setShaderListener(oldShader: CgpShader, newShader: CgpShader): void;
    needsRebuildReason: string;
    getInfo(): {
        class: any;
        name: string;
        rebuildReason: string;
        rebuildCount: number;
        numBindgroups: number;
        bindingGroupLayoutEntries: GPUBindGroupLayoutEntry[];
    };
    pushDebug(): void;
    /**
     * @param {CgpShader} shader
     * @param {CgpMesh} mesh
     */
    setPipeline(shader: CgpShader, mesh?: CgpMesh): void;
    /**
     * @param {CgpShader} shader
     * @returns {GPUPipelineDescriptorBase|GPURenderPipelineDescriptor|GPUComputePipelineDescriptor}
     */
    getPipelineObject(shader: CgpShader): GPUPipelineDescriptorBase | GPURenderPipelineDescriptor | GPUComputePipelineDescriptor;
    /** @type {Array<GPUBindGroupLayoutEntry} */
    bindingGroupLayoutEntries: Array<GPUBindGroupLayoutEntry>;
    getBindingsInfo(bings: any): any[];
    /**
     * @param {CgpShader} shader
     * @param {number} inst
     */
    _bindUniforms(shader: CgpShader, inst: number): void;
    /**
     * @param {CgpShader} shader
     * @param {Array} workGroups
     */
    compute(shader: CgpShader, workGroups?: any[]): void;
    dispose(): void;
    #private;
}
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";
import { CgpContext } from "./cgp_state.js";
