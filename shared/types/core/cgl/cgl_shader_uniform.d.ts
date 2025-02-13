/**
 * Shader uniforms
 *
 * types:
 * <pre>
 * f    - float
 * 2f   - vec2
 * 3f   - vec3
 * 4f   - vec4
 * i    - integer
 * t    - texture
 * m4   - mat4, 4x4 float matrix
 * f[]  - array of floats
 * 2f[] - array of float vec2
 * 3f[] - array of float vec3
 * 4f[] - array of float vec4
 * </pre>
 *
 * @namespace external:CGL
 * @class
 * @param {CgShader} shader
 * @param {String} [type=f]
 * @param {String} name
 * @param {Number|Port} value  can be a Number,Matrix or Port
 * @example
 * // bind float uniform called myfloat and initialize with value 1.0
 * const unir=new CGL.Uniform(shader,'f','myfloat',1.0);
 * unir.setValue(1.0);
 *
 * // bind float uniform called myfloat and automatically set it to input port value
 * const myPort=op.inFloat("input");
 * const pv=new CGL.Uniform(shader,'f','myfloat',myPort);
 *
 */
export class Uniform extends CgUniform {
    _loc: number;
    _cgl: any;
    copy(newShader: any): Uniform;
    /**
     * returns type as glsl type string. e.g. 'f' returns 'float'
     * @function getGlslTypeString
     * @memberof Uniform
     * @instance
     * @return {string} type as string
     */
    getGlslTypeString(): string;
    _isValidLoc(): boolean;
    resetLoc(): void;
    bindTextures(): void;
    getLoc(): number;
    updateValueF(): void;
    setValueF(v: any): void;
    updateValueI(): void;
    updateValue2I(): void;
    updateValue3I(): void;
    updateValue4I(): void;
    setValueI(v: any): void;
    setValue2I(v: any): void;
    setValue3I(v: any): void;
    setValue4I(v: any): void;
    updateValueBool(): void;
    setValueBool(v: any): void;
    setValueArray4F(v: any): void;
    updateValueArray4F(): void;
    setValueArray3F(v: any): void;
    updateValueArray3F(): void;
    setValueArray2F(v: any): void;
    updateValueArray2F(): void;
    setValueArrayF(v: any): void;
    updateValueArrayF(): void;
    setValueArrayT(v: any): void;
    updateValue3F(): void;
    setValue3F(v: any): void;
    updateValue2F(): void;
    setValue2F(v: any): void;
    updateValue4F(): void;
    setValue4F(v: any): void;
    value: any;
    updateValueM4(): void;
    setValueM4(v: any): void;
    updateValueArrayT(): void;
    updateValueT(): void;
    setValueT(v: any): void;
}
export namespace Uniform {
    function glslTypeString(t: any): "float" | "bool" | "int" | "ivec2" | "vec2" | "vec3" | "vec4" | "mat4" | "sampler2D" | "samplerCube";
}
import CgUniform from "../cg/cg_uniform.js";
