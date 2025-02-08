export default class Uniform extends CgUniform {
    _cgp: any;
    gpuBuffer: any;
    updateValueF(): void;
    updateValueArrayF(): void;
    setValueArrayF(v: any): void;
    setValueF(v: any): void;
    updateValue2F(): void;
    setValue2F(v: any): void;
    updateValue3F(): void;
    setValue3F(v: any): void;
    updateValue4F(): void;
    setValue4F(v: any): void;
    setValueT(v: any): void;
    updateValueM4(v: any): void;
    setValueM4(v: any): void;
    setValueAny(v: any): void;
    updateValueAny(): void;
    updateValueT(): void;
    setGpuBuffer(b: any): void;
    copyToBuffer(buff: any, pos?: number): void;
    getWgslTypeStr(): "sampler" | "float" | "int" | "mat4x4f" | "vec4f" | "vec3f" | "vec2f" | "array<vec4f>" | "texture_2d<f32>" | "???";
    getSizeBytes(): number;
    copy(newShader: any): Uniform;
}
import CgUniform from "../cg/cg_uniform.js";
