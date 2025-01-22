export default class Shader extends CgShader {
    constructor(_cgp: any, _name: any, options?: {});
    _cgp: any;
    _name: any;
    _uniforms: any[];
    compute: any;
    _compileReason: string;
    gpuShaderModule: any;
    bindingCounter: number;
    bindCountlastFrame: number;
    _bindingIndexCount: number;
    defaultBindingVert: Binding;
    defaultBindingFrag: Binding;
    defaultBindingComp: Binding;
    bindingsFrag: Binding[];
    bindingsVert: Binding[];
    bindingsComp: Binding[];
    uniModelMatrix: Uniform;
    uniViewMatrix: Uniform;
    uniProjMatrix: Uniform;
    uniNormalMatrix: Uniform;
    uniModelViewMatrix: Uniform;
    _tempNormalMatrix: any;
    _tempModelViewMatrix: any;
    _src: string;
    incBindingCounter(): void;
    reInit(): void;
    get isValid(): boolean;
    get uniforms(): any[];
    getName(): any;
    setWhyCompile(why: any): void;
    getNewBindingIndex(): number;
    setSource(src: any): void;
    _replaceMods(vs: any): any;
    getProcessedSource(): string;
    compile(): void;
    error(e: any): void;
    bind(): void;
    /**
     * add a uniform to the fragment shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniformFrag
     * @returns {Uniform}
     */
    addUniformFrag(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): Uniform;
    needsPipelineUpdate: string;
    /**
     * add a uniform to the vertex shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniformVert
     * @returns {Uniform}
     */
    addUniformVert(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): Uniform;
    /**
     * add a uniform to all shader programs
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniform
     * @returns {Uniform}
     */
    addUniform(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): Uniform;
    _addUniform(uni: any): void;
    getUniform(name: any): any;
    /**
     * copy current shader
     * @function copy
     * @memberof Shader
     * @instance
     * @returns newShader
     */
    copy(): Shader;
    /**
     * copy all uniform values from another shader
     * @function copyUniforms
     * @memberof Shader
     * @instance
     * @param origShader uniform values will be copied from this shader
     */
    copyUniformValues(origShader: any): void;
    dispose(): void;
}
import { CgShader } from "../cg/cg_shader.js";
import Binding from "./cgp_binding.js";
import Uniform from "./cgp_uniform.js";
