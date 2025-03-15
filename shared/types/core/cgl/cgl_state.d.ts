export namespace BLENDS {
    let BLEND_NONE: number;
    let BLEND_NORMAL: number;
    let BLEND_ADD: number;
    let BLEND_SUB: number;
    let BLEND_MUL: number;
}
/**
 * cables gl context/state manager
 * @class
 * @namespace external:CGL
 * @hideconstructor
 */
export class CglContext extends CgContext {
    constructor(_patch: any);
    gApi: number;
    pushMvMatrix: () => void;
    popMvMatrix: () => mat4;
    popmMatrix: () => mat4;
    profileData: ProfileData;
    _log: Logger;
    glVersion: number;
    glUseHalfFloatTex: boolean;
    clearCanvasTransparent: boolean;
    clearCanvasDepth: boolean;
    debugOneFrame: boolean;
    checkGlErrors: boolean;
    maxTextureUnits: number;
    maxVaryingVectors: number;
    currentProgram: any;
    _hadStackError: boolean;
    glSlowRenderer: boolean;
    _isSafariCrap: boolean;
    temporaryTexture: any;
    gl: any;
    _cursor: string;
    _currentCursor: string;
    _glFrameBufferStack: any[];
    _frameBufferStack: any[];
    _shaderStack: any[];
    _stackDepthTest: any[];
    mainloopOp: any;
    _stackBlendMode: any[];
    _stackBlendModePremul: any[];
    _stackBlend: any[];
    _stackDepthFunc: any[];
    _stackCullFaceFacing: any[];
    _stackCullFace: any[];
    _stackDepthWrite: any[];
    _stackStencil: any[];
    _simpleShader: Shader;
    _currentShader: Shader;
    _oldCanvasWidth: number;
    _oldCanvasHeight: number;
    _enabledExtensions: {};
    errorShader: Shader;
    set mvMatrix(m: mat4);
    get mvMatrix(): mat4;
    _setCanvas(canv: any): void;
    glRenderer: any;
    maxAnisotropic: any;
    maxUniformsFrag: any;
    maxUniformsVert: any;
    maxSamples: any;
    DEPTH_FUNCS: any[];
    CULL_MODES: any[];
    getInfo(): {
        glVersion: number;
        glRenderer: any;
        glUseHalfFloatTex: boolean;
        maxVaryingVectors: number;
        maxTextureUnits: number;
        maxTexSize: number;
        maxUniformsFrag: any;
        maxUniformsVert: any;
        maxSamples: any;
    };
    /**
     * @function popViewPort
     * @memberof Context
     * @instance
     * @description pop viewPort stack
     */
    popViewPort(): void;
    /**
     * @function pushViewPort
     * @memberof Context
     * @instance
     * @description push a new viewport onto stack
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    pushViewPort(x: number, y: number, w: number, h: number): void;
    getViewPort(): number[];
    resetViewPort(): void;
    setViewPort(x: any, y: any, w: any, h: any): void;
    /**
     * @param {function} cb
     * @param {boolean} doScreenshotClearAlpha
     * @param {string} mimeType
     * @param {number} quality
     */
    screenShot(cb: Function, doScreenshotClearAlpha: boolean, mimeType: string, quality: number): void;
    endFrame(): void;
    _frameStarted: boolean;
    logStackError(str: any): void;
    getShader(): any;
    getDefaultShader(): Shader;
    /**
     * @deprecated
     * @param {Shader} s
     */
    setShader(s: Shader): void;
    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Shader} shader
     * @function
     */
    pushShader(shader: Shader): void;
    popShader(): void;
    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    setPreviousShader(): void;
    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Object} fb framebuffer
     * @function
     */
    pushGlFrameBuffer(fb: any): void;
    /**
     * pop framebuffer stack
     * @function popGlFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    popGlFrameBuffer(): any;
    /**
     * get current framebuffer
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    getCurrentGlFrameBuffer(): any;
    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Framebuffer2} fb framebuffer
     */
    pushFrameBuffer(fb: Framebuffer2): void;
    /**
     * pop framebuffer stack
     * @function popFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer2} current framebuffer or null
     */
    popFrameBuffer(): Framebuffer2;
    /**
     * get current framebuffer
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer2} current framebuffer or null
     */
    getCurrentFrameBuffer(): Framebuffer2;
    renderStart(cgl: any, identTranslate: any, identTranslateView: any): void;
    renderEnd(cgl: any): void;
    getTexture(slot: any): any;
    hasFrameStarted(): boolean;
    /**
     * log warning to console if the rendering of one frame has not been started / handy to check for async problems
     * @function checkFrameStarted
     * @memberof Context
     * @param string
     * @instance
     */
    checkFrameStarted(string: any): void;
    setTexture(slot: any, t: any, type: any): boolean;
    fullScreen(): void;
    printError(str: any): boolean;
    _loggedGlError: boolean;
    _dispose(): void;
    /**
     * push depth testing enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    pushDepthTest(enabled: boolean): void;
    /**
     * current state of depth testing
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthTest(): boolean;
    /**
     * pop depth testing state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popDepthTest(): void;
    /**
     * push depth write enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    pushDepthWrite(enabled: boolean): void;
    /**
     * current state of depth writing
     * @function stateDepthWrite
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthWrite(): boolean;
    /**
     * pop depth writing state
     * @function popDepthWrite
     * @memberof Context
     * @instance
     */
    popDepthWrite(): void;
    /**
     * push face culling face enabled state
     * @function pushCullFace
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    pushCullFace(enabled: boolean): void;
    /**
     * current state of face culling
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFace(): boolean;
    /**
     * pop face culling enabled state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popCullFace(): void;
    /**
     * push face culling face side
     * @function pushCullFaceFacing
     * @param {Number} cgl.gl.FRONT_AND_BACK, cgl.gl.BACK or cgl.gl.FRONT
     * @memberof Context
     * @instance
     */
    pushCullFaceFacing(b: any): void;
    /**
     * current state of face culling side
     * @function stateCullFaceFacing
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFaceFacing(): boolean;
    /**
     * pop face culling face side
     * @function popCullFaceFacing
     * @memberof Context
     * @instance
     */
    popCullFaceFacing(): void;
    /**
     * enable / disable depth testing
     * like `gl.depthFunc(boolean);`
     * @function pushDepthFunc
     * @memberof Context
     * @instance
     * @param {Boolean} f depthtesting
     */
    pushDepthFunc(f: boolean): void;
    /**
     * current state of blend
     * @function stateDepthFunc
     * @memberof Context
     * @instance
     * @returns {Boolean} depth testing enabled/disabled
     */
    stateDepthFunc(): boolean;
    /**
     * pop depth testing and set the previous state
     * @function popDepthFunc
     * @memberof Context
     * @instance
     */
    popDepthFunc(): void;
    /**
     * enable / disable blend
     * like gl.enable(gl.BLEND); / gl.disable(gl.BLEND);
     * @function pushBlend
     * @memberof Context
     * @instance
     * @param {boolean} b blending
     */
    pushBlend(b: boolean): void;
    /**
     * pop blend state and set the previous state
     * @function popBlend
     * @memberof Context
     * @instance
     */
    popBlend(): void;
    /**
     * current state of blend
     * @function stateBlend
     * @returns {boolean} blending enabled/disabled
     * @memberof Context
     * @instance
     */
    stateBlend(): boolean;
    /**
     * push and switch to predefined blendmode (CONSTANTS.BLEND_MODES.BLEND_NONE,CONSTANTS.BLEND_MODES.BLEND_NORMAL,CONSTANTS.BLEND_MODES.BLEND_ADD,CONSTANTS.BLEND_MODES.BLEND_SUB,CONSTANTS.BLEND_MODES.BLEND_MUL)
     * @function pushBlendMode
     * @memberof Context
     * @instance
     * @param {Number} blendMode
     * @param {Boolean} premul premultiplied mode
     */
    pushBlendMode(blendMode: number, premul: boolean): void;
    /**
     * pop predefined blendmode / switch back to previous blendmode
     * @function popBlendMode
     * @memberof Context
     * @instance
     */
    popBlendMode(): void;
    /**
     * enable / disable stencil testing

    * @function pushStencil
    * @memberof Context
    * @instance
    * @param {Boolean} b enable
    */
    pushStencil(b: boolean): void;
    /**
     * pop stencil test state and set the previous state
     * @function popStencil
     * @memberof Context
     * @instance
     */
    popStencil(): void;
    glGetAttribLocation(prog: any, name: any): any;
    /**
     * should an op now draw helpermeshes
     * @function shouldDrawHelpers
     * @memberof Context
     * @param op
     * @instance
     */
    shouldDrawHelpers(op: any): any;
    _setBlendMode(blendMode: any, premul: any): void;
    /**
     * @param {Geometry} options
     * @param {CglMeshOptions} options
     */
    createMesh(geom: any, options: Geometry): Mesh;
    /**
     * set cursor
     * @function setCursor
     * @memberof Context
     * @instance
     * @param {String} str css cursor string
     */
    setCursor(str: string): void;
    /**
     * enable a webgl extension
     * @function enableExtension
     * @memberof Context
     * @instance
     * @param {String} name extension name
     * @returns {Object} extension object or null
     */
    enableExtension(name: string): any;
    getErrorShader(): Shader;
}
import { CgContext } from "../cg/cg_state.js";
import { ProfileData } from "./cgl_profiledata.js";
import { Logger } from "cables-shared-client";
import { Shader } from "./cgl_shader.js";
import { Framebuffer2 } from "./cgl_framebuffer2.js";
import { Geometry } from "../cg/cg_geom.js";
import { Mesh } from "./cgl_mesh.js";
