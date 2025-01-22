export default class Binding {
    /**
     * Description
     * @param {any} cgp
     * @param {any} idx
     * @param {string} name
     * @param {any} options={}
     */
    constructor(cgp: any, name: string, options?: any);
    _index: any;
    _name: string;
    _cgp: any;
    _log: Logger;
    uniforms: any[];
    cGpuBuffers: any[];
    _options: any;
    shader: any;
    bindingInstances: any[];
    stageStr: any;
    bindingType: any;
    stage: any;
    _buffer: any;
    isValid: boolean;
    changed: number;
    isStruct(): boolean;
    copy(newShader: any): Binding;
    addUniform(uni: any): void;
    getSizeBytes(): number;
    getShaderHeaderCode(): string;
    getBindingGroupLayoutEntry(): {
        label: string;
        binding: any;
        visibility: any;
        size: number;
    };
    getBindingGroupEntry(gpuDevice: any, inst: any): {
        label: string;
        binding: any;
        size: number;
        visibility: any;
    };
    _createCgpuBuffer(inst: any): void;
    update(cgp: any, inst: any): void;
}
import { Logger } from "cables-shared-client";
