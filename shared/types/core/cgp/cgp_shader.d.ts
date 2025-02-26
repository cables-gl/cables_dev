/** @typedef CgpShaderOptions
 * @property {Boolean} [compute]
 * @property {String} [entryPoint]
 */
export class CgpShader extends CgShader {
    /**
     * @param {number} stage
     */
    static getStageString(stage: number): "frag" | "vertex" | "compute";
    /**
     * @param {CgpContext} _cgp
     * @param {String} _name
     * @param {CgpShaderOptions} options={}
     */
    constructor(_cgp: CgpContext, _name: string, options?: CgpShaderOptions);
    _log: Logger;
    _cgp: CgpContext;
    _name: string;
    _uniforms: any[];
    options: CgpShaderOptions;
    gpuShaderModule: GPUShaderModule;
    frameUsageCounter: number;
    lastFrameUsageCounter: number;
    frameUsageFrame: number;
    _bindingIndexCount: number;
    /** @type {Array<Binding>} */
    bindingsFrag: Array<Binding>;
    /** @type {Array<Binding>} */
    bindingsVert: Array<Binding>;
    /** @type {Array<Binding>} */
    bindingsCompute: Array<Binding>;
    /** @type {Binding} */
    defaultBindingCompute: Binding;
    /** @type {Binding} */
    defaultBindingVert: Binding;
    /** @type {Binding} */
    defaultBindingFrag: Binding;
    uniModelMatrix: CgpUniform;
    uniViewMatrix: CgpUniform;
    uniProjMatrix: CgpUniform;
    uniNormalMatrix: CgpUniform;
    uniModelViewMatrix: CgpUniform;
    _tempNormalMatrix: any;
    _tempModelViewMatrix: any;
    _src: string;
    reInit(): void;
    get isValid(): boolean;
    get uniforms(): any[];
    getName(): string;
    incFrameUsageCount(): number;
    getNewBindingGroupIndex(): number;
    /**
     * @param {String} src
     */
    setSource(src: string): void;
    /**
     * @param {String} vs
     */
    _replaceMods(vs: string): string;
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
     * @returns {CgpUniform}
     */
    addUniformFrag(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): CgpUniform;
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
     * @returns {CgpUniform}
     */
    addUniformVert(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): CgpUniform;
    /**
     * @typedef UniformDescriptor
     * @property {String} name
     * @property {Number} shaderType GPUShaderStage.FRAGMENT
     * @property {String} type 4f,f, etc
     * @property {Array} values ports or numbers
    */
    /**
     * @param {UniformDescriptor} o
     */
    addUniformObject(o: {
        name: string;
        /**
         * GPUShaderStage.FRAGMENT
         */
        shaderType: number;
        /**
         * 4f,f, etc
         */
        type: string;
        /**
         * ports or numbers
         */
        values: any[];
    }): CgpUniform;
    /**
     * @param {CgpUniform} uni
     */
    _addUniform(uni: CgpUniform): void;
    /**
     * @param {String} name
     */
    getUniform(name: string): any;
    /**
     * copy current shader
     * @function copy
     * @memberof Shader
     * @instance
     * @returns newShader
     */
    copy(): CgpShader;
    /**
     * copy all uniform values from another shader
     * @function copyUniforms
     * @memberof Shader
     * @instance
     * @param origShader uniform values will be copied from this shader
     */
    copyUniformValues(origShader: any): void;
    dispose(): void;
    getInfo(): {
        class: any;
        name: string;
        frameUsageCounter: number;
        lastCompileReason: string;
        compileCount: number;
        numUniforms: number;
        numDefines: number;
        isCompute: boolean;
    };
    #private;
}
export type CgpShaderOptions = {
    compute?: boolean;
    entryPoint?: string;
};
import { CgShader } from "../cg/cg_shader.js";
import { Logger } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";
import { Binding } from "./cgp_binding.js";
import { CgpUniform } from "./cgp_uniform.js";
