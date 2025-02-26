/**
 * @typedef PatchConfig
 * @property {String} [prefixAssetPath=''] prefix for path to assets
 * @property {String} [assetPath=''] path to assets
 * @property {String} [jsPath=''] path to javascript files
 * @property {String} [glCanvasId='glcanvas'] dom element id of canvas element
 * @property {Function} [onError=null] called when an error occurs
 * @property {Function} [onFinishedLoading=null] called when patch finished loading all assets
 * @property {Function} [onFirstFrameRendered=null] called when patch rendered it's first frame
 * @property {Boolean} [glCanvasResizeToWindow=false] resize canvas automatically to window size
 * @property {Boolean} [doRequestAnimation=true] do requestAnimationFrame set to false if you want to trigger exec() from outside (only do if you know what you are doing)
 * @property {Boolean} [clearCanvasColor=true] clear canvas in transparent color every frame
 * @property {Boolean} [clearCanvasDepth=true] clear depth every frame
 * @property {Boolean} [glValidateShader=true] enable/disable validation of shaders *
 * @property {Boolean} [silent=false]
 * @property {Number} [fpsLimit=0] 0 for maximum possible frames per second
 * @property {String} [glslPrecision='mediump'] default precision for glsl shader
 * @property {String} [prefixJsPath]
 * @property {Function} [onPatchLoaded]
 *
 */
/**
 * Patch class, contains all operators,values,links etc. manages loading and running of the whole patch
 *
 * see {@link PatchConfig}
 *
 * @example
 * CABLES.patch=new CABLES.Patch(
 * {
 *     patch:pStr,
 *     glCanvasId:'glcanvas',
 *     glCanvasResizeToWindow:true,
 *     canvas:{powerPreference:"high-performance"},
 *     prefixAssetPath:'/assets/',
 *     prefixJsPath:'/js/',
 *     onError:function(e){console.log(e);}
 *     glslPrecision:'highp'
 * });
 */
export class Patch extends Events {
    static EVENT_OP_DELETED: string;
    static EVENT_OP_ADDED: string;
    static EVENT_PAUSE: string;
    static EVENT_RESUME: string;
    static EVENT_PATCHLOADEND: string;
    static EVENT_VARIABLES_CHANGED: string;
    /** @param {PatchConfig} cfg */
    constructor(cfg: PatchConfig);
    _log: Logger;
    /** @type {Array<Op>} */
    ops: Array<Op>;
    settings: {};
    /** @type {PatchConfig} */
    config: PatchConfig;
    timer: Timer;
    freeTimer: Timer;
    animFrameOps: any[];
    animFrameCallbacks: any[];
    gui: boolean;
    silent: boolean;
    profiler: Profiler;
    aborted: boolean;
    _crashedOps: any[];
    _animReq: any;
    _opIdCache: {};
    _triggerStack: any[];
    storeObjNames: boolean;
    /** @type {LoadingStatus} */
    loading: LoadingStatus;
    _volumeListeners: any[];
    _paused: boolean;
    _frameNum: number;
    onOneFrameRendered: any;
    namedTriggers: {};
    _origData: any;
    _frameNext: number;
    _frameInterval: number;
    _lastFrameTime: number;
    _frameWasdelayed: boolean;
    tempData: {};
    frameStore: {};
    reqAnimTimeStamp: number;
    cgCanvas: any;
    _variables: {};
    vars: any;
    cgl: CglContext;
    cgp: any;
    _subpatchOpCache: {};
    isPlaying(): boolean;
    /** @deprecated */
    renderOneFrame(): void;
    _renderOneFrame: boolean;
    /**
     * returns true if patch is opened in editor/gui mode
     * @function isEditorMode
     * @memberof Patch
     * @instance
     * @return {Boolean} editor mode
     */
    isEditorMode(): boolean;
    /**
     * pauses patch execution
     * @function pause
     * @memberof Patch
     * @instance
     */
    pause(): void;
    /**
     * resumes patch execution
     * @function resume
     * @memberof Patch
     * @instance
     */
    resume(): void;
    /**
     * set volume [0-1]
     * @function setVolume
     * @param {Number} v volume
     * @memberof Patch
     * @instance
     */
    setVolume(v: number): void;
    /**
     * get asset path
     * @function getAssetPath
     * @memberof Patch
     * @param patchId
     * @instance
     */
    getAssetPath(patchId?: any): string;
    /**
     * get js path
     * @function getJsPath
     * @memberof Patch
     * @instance
     */
    getJsPath(): string;
    /**
     * get url/filepath for a filename
     * this uses prefixAssetpath in exported patches
     * @function getFilePath
     * @memberof Patch
     * @instance
     * @param {String} filename
     * @return {String} url
     */
    getFilePath(filename: string): string;
    clear(): void;
    /**
     * @param {string} identifier
     * @param {string} id
     * @param {string} [opName]
     */
    createOp(identifier: string, id: string, opName?: string): Op;
    /**
     * create a new op in patch
     * @function addOp
     * @memberof Patch
     * @instance
     * @param {string} opIdentifier uuid or name, e.g. Ops.Math.Sum
     * @param {OpUiAttribs} uiAttribs Attributes
     * @param {string} id
     * @param {boolean} [fromDeserialize]
     * @param {string} [opName] e.g. Ops.Math.Sum
     * @example
     * // add invisible op
     * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
     */
    addOp(opIdentifier: string, uiAttribs: OpUiAttribs, id: string, fromDeserialize?: boolean, opName?: string): Op;
    addOnAnimFrame(op: any): void;
    removeOnAnimFrame(op: any): void;
    addOnAnimFrameCallback(cb: any): void;
    removeOnAnimCallback(cb: any): void;
    deleteOp(opid: any, tryRelink: any, reloadingOp: any): void;
    getFrameNum(): number;
    emitOnAnimFrameEvent(time: any, delta: any): void;
    renderFrame(timestamp: any): void;
    exec(timestamp: any): void;
    /**
     * link two ops/ports
     * @function link
     * @memberof Patch
     * @instance
     * @param {Op} op1
     * @param {String} port1Name
     * @param {Op} op2
     * @param {String} port2Name
     * @param {boolean} lowerCase
     * @param {boolean} fromDeserialize
     */
    link(op1: Op, port1Name: string, op2: Op, port2Name: string, lowerCase?: boolean, fromDeserialize?: boolean): false | void | Link;
    serialize(options: any): string | {
        ops: any[];
        settings: {};
    };
    getOpsByRefId(refId: any): any[];
    getOpById(opid: any): any;
    /**
     * @param {String} name
     */
    getOpsByObjName(name: string): Op[];
    /**
     * @param {UUID} opid
     */
    getOpsByOpId(opid: UUID): Op[];
    /**
     * @param {String} which
     */
    loadLib(which: string): void;
    getSubPatchOpsByName(patchId: any, objName: any): Op[];
    getSubPatchOp(patchId: any, objName: any): false | Op;
    getFirstSubPatchOpByName(patchId: any, objName: any): false | Op;
    _addLink(opinid: any, opoutid: any, inName: any, outName: any): false | void | Link;
    deSerialize(obj: any, options: any): void;
    namespace: any;
    name: any;
    profile(enable: any): void;
    /**
     * set variable value
     * @function setVariable
     * @memberof Patch
     * @instance
     * @param {String} name of variable
     * @param {Number|String|Boolean} val value
     */
    setVariable(name: string, val: number | string | boolean): void;
    _sortVars(): void;
    /**
     * has variable
     * @function hasVariable
     * @memberof Patch
     * @instance
     * @param {String} name of variable
     */
    hasVar(name: string): boolean;
    setVarValue(name: any, val: any, type: any): any;
    getVarValue(name: any, val: any): any;
    /**
     * @function getVar
     * @memberof Patch
     * @instance
     * @param {String} name
     * @return {Variable} variable
     */
    getVar(name: string): Variable;
    deleteVar(name: any): void;
    /**
     * @param {number} t
     * @returns {any}
     */
    getVars(t: number): any;
    /**
     * @function preRenderOps
     * @memberof Patch
     * @instance
     * @description invoke pre rendering of ops
     * @function
     */
    preRenderOps(): void;
    /**
     * @function dispose
     * @memberof Patch
     * @instance
     * @description stop, dispose and cleanup patch
     */
    dispose(): void;
    pushTriggerStack(p: any): void;
    popTriggerStack(): void;
    printTriggerStack(): void;
    /**
     * returns document object of the patch could be != global document object when opening canvas ina popout window
     * @function getDocument
     * @memberof Patch
     * @instance
     * @return {Object} document
     */
    getDocument(): any;
    #private;
}
export namespace Patch {
    function getOpClass(objName: any): Window;
    function replaceOpIds(json: any, options: any): any;
}
export type PatchConfig = {
    /**
     * prefix for path to assets
     */
    prefixAssetPath?: string;
    /**
     * path to assets
     */
    assetPath?: string;
    /**
     * path to javascript files
     */
    jsPath?: string;
    /**
     * dom element id of canvas element
     */
    glCanvasId?: string;
    /**
     * called when an error occurs
     */
    onError?: Function;
    /**
     * called when patch finished loading all assets
     */
    onFinishedLoading?: Function;
    /**
     * called when patch rendered it's first frame
     */
    onFirstFrameRendered?: Function;
    /**
     * resize canvas automatically to window size
     */
    glCanvasResizeToWindow?: boolean;
    /**
     * do requestAnimationFrame set to false if you want to trigger exec() from outside (only do if you know what you are doing)
     */
    doRequestAnimation?: boolean;
    /**
     * clear canvas in transparent color every frame
     */
    clearCanvasColor?: boolean;
    /**
     * clear depth every frame
     */
    clearCanvasDepth?: boolean;
    /**
     * enable/disable validation of shaders *
     */
    glValidateShader?: boolean;
    silent?: boolean;
    /**
     * 0 for maximum possible frames per second
     */
    fpsLimit?: number;
    /**
     * default precision for glsl shader
     */
    glslPrecision?: string;
    prefixJsPath?: string;
    onPatchLoaded?: Function;
};
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
import { Op } from "./core_op.js";
import { Timer } from "./timer.js";
import { Profiler } from "./core_profiler.js";
import { LoadingStatus } from "./loadingstatus.js";
import { CglContext } from "./cgl/cgl_state.js";
import { Link } from "./core_link.js";
