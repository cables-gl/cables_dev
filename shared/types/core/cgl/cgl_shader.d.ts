export { CglShader as Shader };
/**
 * @class
 * @namespace external:CGL
 * @hideconstructor
 * @param _cgl
 * @param _name
 * @param _op
 * @example
 * var shader=new CGL.Shader(cgl,'MinimalMaterial');
 * shader.setSource(attachments.shader_vert,attachments.shader_frag);
 */
declare class CglShader extends CgShader {
    constructor(_cgl: any, _name: any, _op: any);
    _log: Logger;
    _cgl: any;
    _name: any;
    opId: any;
    glslVersion: number;
    _materialId: number;
    _program: any;
    _uniforms: any[];
    _drawBuffers: boolean[];
    ignoreMissingUniforms: boolean;
    _projMatrixUniform: any;
    _mvMatrixUniform: any;
    _mMatrixUniform: any;
    _vMatrixUniform: any;
    _camPosUniform: any;
    _normalMatrixUniform: any;
    _inverseViewMatrixUniform: any;
    _fromUserInteraction: boolean;
    _attrVertexPos: number;
    precision: any;
    _pMatrixState: number;
    _vMatrixState: number;
    _countMissingUniforms: number;
    _modGroupCount: number;
    _feedBackNames: any[];
    _attributes: any[];
    glPrimitive: any;
    offScreenPass: boolean;
    _extensions: any[];
    srcVert: any;
    srcFrag: string;
    lastCompile: number;
    _libs: any[];
    _structNames: any[];
    _structUniformNames: any[];
    _textureStackUni: any[];
    _textureStackTex: any[];
    _textureStackType: any[];
    _textureStackTexCgl: any[];
    _tempNormalMatrix: any;
    _tempCamPosMatrix: any;
    _tempInverseViewMatrix: any;
    _tempInverseProjMatrix: any;
    isValid(): boolean;
    getCgl(): any;
    getName(): any;
    /**
     * @param {string} name
     */
    enableExtension(name: string): void;
    getAttrVertexPos(): number;
    hasTextureUniforms(): boolean;
    /**
     * copy all uniform values from another shader
     * @function copyUniforms
     * @memberof Shader
     * @instance
     * @param origShader uniform values will be copied from this shader
     */
    copyUniformValues(origShader: any): void;
    /**
     * copy current shader
     * @function copy
     * @memberof Shader
     * @instance
     * @returns newShader
     */
    copy(): CglShader;
    /**
     * set shader source code
     * @function setSource
     * @memberof Shader
     * @instance
     * @param {String} srcVert
     * @param {String} srcFrag
     * @param {Boolean} fromUserInteraction
     */
    setSource(srcVert: string, srcFrag: string, fromUserInteraction?: boolean): void;
    _addLibs(src: any): any;
    createStructUniforms(): string[];
    _injectedStringsFrag: {};
    _injectedStringsVert: {};
    _structUniformNamesIndicesFrag: any[];
    _structUniformNamesIndicesVert: any[];
    _uniDeclarationsFrag: any[];
    _uniDeclarationsVert: any[];
    _getAttrSrc(attr: any, firstLevel: any): {
        srcHeadVert: string;
        srcVert: string;
        srcHeadFrag: string;
    };
    compile(): void;
    finalShaderFrag: string;
    finalShaderVert: string;
    bind(): true;
    _inverseProjMatrixUniform: any;
    _materialIdUniform: any;
    _objectIdUniform: any;
    unBind(): void;
    dispose(): void;
    setDrawBuffers(arr: any): void;
    getUniforms(): any[];
    getUniform(name: any): any;
    removeAllUniforms(): void;
    removeUniform(name: any): void;
    _addUniform(uni: any): void;
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
     * @returns {CGL.Uniform}
     */
    addUniformFrag(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): CGL.Uniform;
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
     * @returns {CGL.Uniform}
     */
    addUniformVert(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): CGL.Uniform;
    /**
     * add a uniform to both shaders
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniformBoth
     * @returns {CGL.Uniform}
     */
    addUniformBoth(type: string, name: string, valueOrPort: any, p2: any, p3: any, p4: any): CGL.Uniform;
    /**
     * add a struct & its uniforms to the fragment shader
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure

     * @memberof Shader
     * @instance
     * @function addUniformStructFrag
     * @returns {Object}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructFrag("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructFrag(structName: string, uniformName: string, members: any[]): any;
    /**
     * add a struct & its uniforms to the vertex shader
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure

     * @memberof Shader
     * @instance
     * @function addUniformStructVert
     * @returns {CGL.Uniform}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructVert("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructVert(structName: string, uniformName: string, members: any[]): CGL.Uniform;
    /**
     * add a struct & its uniforms to the both shaders. PLEASE NOTE: it is not possible to add the same struct to both shaders when it contains ANY integer members.
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure

     * @memberof Shader
     * @instance
     * @function addUniformStructBoth
     * @returns {Object}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructBoth("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructBoth(structName: string, uniformName: string, members: any[]): any;
    /**
     * @param {String} name
     */
    hasUniform(name: string): boolean;
    /**
     * @param {String} vstr
     * @param {String} fstr
     */
    _createProgram(vstr: string, fstr: string): any;
    vshader: any;
    fshader: any;
    hasErrors(): boolean;
    _linkProgram(program: any, vstr: any, fstr: any): void;
    _hasErrors: boolean;
    getProgram(): any;
    setFeedbackNames(names: any): void;
    /**
      * adds attribute definition to shader header without colliding with other shader modules...
     * when attrFrag is defined, vertex shader will output this attribute to the fragment shader
     * @function
     * @memberof Shader
     * @instance
     * @param {Object} attr {type:x,name:x,[nameFrag:x]}
     * @return {Object}
     */
    addAttribute(attr: any): any;
    bindTextures(): void;
    _bindTextures(): void;
    setUniformTexture(uni: any, tex: any): any;
    /**
     * push a texture on the stack. those textures will be bound when binding the shader. texture slots are automatically set
     * @param {uniform} uniform texture uniform
     * @param {texture} t texture
     * @param {type} type texture type, can be ignored when TEXTURE_2D
     * @function pushTexture
     * @memberof Shader
     * @instance
     */
    pushTexture(uniform: any, t: texture, type: any): void;
    /**
     * pop last texture
     * @function popTexture
     * @memberof Shader
     * @instance
     */
    popTexture(): void;
    /**
     * pop all textures
     * @function popTextures
     * @memberof Shader
     * @instance
     */
    popTextures(): void;
    getMaterialId(): number;
    getInfo(): {
        name: any;
        defines: string[][];
        hasErrors: boolean;
    };
    getDefaultFragmentShader(r: any, g: any, b: any, a: any): string;
    getDefaultVertexShader(): any;
}
declare namespace CglShader {
    export { getDefaultVertexShader };
    export { getDefaultFragmentShader };
    export function getErrorFragmentShader(): string;
    export function createShader(cgl: any, str: any, type: any, cglShader: any): any;
}
import { CgShader } from "../cg/cg_shader.js";
import { Logger } from "cables-shared-client";
declare function getDefaultVertexShader(): any;
declare function getDefaultFragmentShader(r: any, g: any, b: any): string;
