export default class Pipeline {
    static DEPTH_COMPARE_FUNCS_STRINGS: string[];
    /**
     * Description
     * @param {WebGpuContext} _cgp
     * @param {String} name
     */
    constructor(_cgp: WebGpuContext, name: string);
    shaderNeedsPipelineUpdate: string;
    get isValid(): boolean;
    /**
     * @param {String} name
     */
    setName(name: string): void;
    /**
     * @param {Shader} oldShader
     * @param {Shader} newShader
     */
    setShaderListener(oldShader: Shader, newShader: Shader): void;
    getInfo(): string[];
    /**
     * @param {Shader} shader
     * @param {Mesh} mesh
     */
    setPipeline(shader: Shader, mesh: Mesh): void;
    /**
     * @param {CgpShader} shader
     * @param {Mesh} mesh
     */
    getPipelineObject(shader: CgpShader, mesh: Mesh): {
        label: string;
        layout: any;
        vertex: {
            module: any;
            entryPoint: string;
            buffers: {
                arrayStride: number;
                attributes: {
                    shaderLocation: number;
                    offset: number;
                    format: string;
                }[];
            }[];
        };
        fragment: {
            module: any;
            entryPoint: string;
            targets: {
                format: any;
                blend: any;
            }[];
        };
        primitive: {
            topology: string;
            cullMode: any;
        };
        depthStencil: {
            depthWriteEnabled: any;
            depthCompare: any;
            format: string;
        };
    };
    bindingGroupLayoutEntries: any[];
    bindGroupLayout: any;
    _bindUniforms(shader: any, inst: any): void;
    #private;
}
import Shader from "./cgp_shader.js";
import Mesh from "./cgp_mesh.js";
import CgpShader from "./cgp_shader.js";
import { WebGpuContext } from "./cgp_state.js";
