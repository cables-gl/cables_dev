export default class Pipeline {
    constructor(_cgp: any, name: any);
    _name: any;
    _cgp: any;
    _isValid: boolean;
    _log: Logger;
    _pipeCfg: {
        label: any;
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
    _renderPipeline: any;
    _bindGroups: any[];
    _shaderListeners: any[];
    shaderNeedsPipelineUpdate: string;
    _old: {};
    DEPTH_COMPARE_FUNCS_STRINGS: string[];
    get isValid(): boolean;
    setName(name: any): void;
    setShaderListener(oldShader: any, newShader: any): void;
    getInfo(): string[];
    setPipeline(shader: any, mesh: any): void;
    getPipelineObject(shader: any, mesh: any): {
        label: any;
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
}
import { Logger } from "cables-shared-client";
