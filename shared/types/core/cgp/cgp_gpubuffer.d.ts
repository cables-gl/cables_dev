export default class GPUBuffer extends Events {
    constructor(cgp: any, name: any, data?: any, options?: {});
    id: any;
    _name: any;
    floatArr: Float32Array;
    _gpuBuffer: any;
    needsUpdate: boolean;
    _length: number;
    _buffCfg: any;
    setData(d: any): void;
    setLength(s: any): void;
    updateGpuBuffer(cgp: any): void;
    _cgp: any;
    get name(): any;
    get gpuBuffer(): any;
    get length(): number;
    getSizeBytes(): number;
    dispose(): void;
}
import { Events } from "cables-shared-client";
