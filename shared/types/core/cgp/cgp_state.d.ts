/**
 * cables webgpu context/state manager
 * @class
 * @namespace external:CGP
 * @hideconstructor
 */
export class CgpContext extends CgContext {
    branchProfiler: any;
    lastErrorMsg: string;
    _log: Logger;
    gApi: number;
    _viewport: number[];
    _shaderStack: any[];
    _simpleShader: CgpShader;
    frame: number;
    catchErrors: boolean;
    _stackCullFaceFacing: any[];
    _stackDepthTest: any[];
    _stackCullFace: any[];
    _stackDepthFunc: any[];
    _stackDepthWrite: any[];
    _stackErrorScope: any[];
    _stackBlend: any[];
    _stackErrorScopeLogs: any[];
    currentPipeDebug: any;
    canvasAttachments: any[];
    /** @type {GPUDevice} */
    device: GPUDevice;
    /** @type {GPURenderPassEncoder} */
    passEncoder: GPURenderPassEncoder;
    _defaultBlend: {
        color: {
            operation: string;
            srcFactor: string;
            dstFactor: string;
        };
        alpha: {
            operation: string;
            srcFactor: string;
            dstFactor: string;
        };
    };
    DEPTH_FUNCS: string[];
    CULL_MODES: string[];
    get supported(): boolean;
    /**
     * Description
     * @param {any} cgp
     * @param {any} identTranslate
     * @param {any} identTranslateView
     * @returns {any}
     */
    renderStart(cgp: any, identTranslate: any, identTranslateView: any): any;
    renderEnd(): void;
    setViewPort(x: any, y: any, w: any, h: any): void;
    /**
     * @function getViewPort
     * @memberof Context
     * @instance
     * @description get current gl viewport
     * @returns {Array} array [x,y,w,h]
     */
    getViewPort(): any[];
    /**
     * @param {Geometry} geom
     * @param {any} glPrimitive
     * @returns {CgpMesh}
     */
    createMesh(geom: Geometry, glPrimitive: any): CgpMesh;
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
    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Object} shader
     * @function
    */
    pushShader(shader: any): void;
    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    popShader(): void;
    getShader(): any;
    /**
     * @param {GPUDevice} device
     */
    setDevice(device: GPUDevice): void;
    _emptyTexture: any;
    _defaultTexture: any;
    _errorTexture: any;
    /** @typedef ErrorScoprOptions
     * @property {string} scope
     */
    /**
     * @param {String} name
     * @param {ErrorScoprOptions} options
     */
    pushErrorScope(name: string, options?: {
        scope: string;
    }): void;
    /**
     * @param {Function} [cb]
     */
    popErrorScope(cb?: Function): void;
    /**
     * push depth testing enabled state
     * @function pushDepthTest
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushDepthTest(b: boolean): void;
    /**
     * current state of depth testing
     * @function stateDepthTest
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthTest(): boolean;
    /**
     * pop depth testing state
     * @function popDepthTest
     * @memberof Context
     * @instance
     */
    popDepthTest(): void;
    /**
     * push depth write enabled state
     * @function pushDepthWrite
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushDepthWrite(b: boolean): void;
    /**
     * current state of depth writing
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthWrite(): boolean;
    /**
     * pop depth writing state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popDepthWrite(): void;
    /**
     * @function pushDepthFunc
     * @memberof Context
     * @instance
     * @param {string} f depth compare func
     */
    pushDepthFunc(f: string): void;
    /**
     * @function stateDepthFunc
     * @memberof Context
     * @instance
     * @returns {boolean}
     */
    stateDepthFunc(): boolean;
    /**
     * pop depth compare func
     * @function popDepthFunc
     * @memberof Context
     * @instance
     */
    popDepthFunc(): void;
    /**
     * push face culling face enabled state
     * @function pushCullFace
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushCullFace(b: boolean): void;
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
     * @memberof Context
     * @param b
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
    pushBlend(b: any): void;
    popBlend(): void;
    stateBlend(): any;
    getEmptyTexture(): any;
    getErrorTexture(): any;
    getDefaultTexture(): any;
    /**
     * @param {function} cb
     * @param {boolean} doScreenshotClearAlpha
     * @param {string} mimeType
     * @param {number} quality
     */
    screenShot(cb: Function, doScreenshotClearAlpha: boolean, mimeType: string, quality: number): void;
}
import { CgContext } from "../cg/cg_state.js";
import { Logger } from "cables-shared-client";
import { CgpShader } from "./cgp_shader.js";
import { Geometry } from "../cg/cg_geom.js";
import { CgpMesh } from "./cgp_mesh.js";
