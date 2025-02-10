export default Patch;
/**
 * configuration object for loading a patch
 */
export type PatchConfig = any;
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
declare class Patch extends Events {
    /** @param {PatchConfig} cfg */
    constructor(cfg: PatchConfig);
    _log: Logger;
    /** @type {Array<Op>} */
    ops: Array<Op>;
    settings: {};
    config: any;
    timer: Timer;
    freeTimer: Timer;
    animFrameOps: any[];
    animFrameCallbacks: any[];
    gui: boolean;
    silent: any;
    profiler: Profiler;
    aborted: boolean;
    _crashedOps: any[];
    _renderOneFrame: boolean;
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
    deSerialized: boolean;
    reqAnimTimeStamp: number;
    cgCanvas: any;
    _isLocal: boolean;
    _variables: {};
    _variableListeners: any[];
    vars: any;
    cgl: Context;
    cgp: any;
    _subpatchOpCache: {};
    isPlaying(): boolean;
    isRenderingOneFrame(): boolean;
    /** @deprecated */
    renderOneFrame(): void;
    /**
     * current number of frames per second
     * @function getFPS
     * @memberof Patch
     * @instance
     * @return {Number} fps
     */
    getFPS(): number;
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
    getAssetPath(patchId?: any): any;
    /**
     * get js path
     * @function getJsPath
     * @memberof Patch
     * @instance
     */
    getJsPath(): any;
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
    createOp(identifier: any, id: any, opName?: any): Op;
    /**
     * create a new op in patch
     * @function addOp
     * @memberof Patch
     * @instance
     * @param {string} opIdentifier uuid or name, e.g. Ops.Math.Sum
     * @param {Object} uiAttribs Attributes
     * @param {string} id
     * @param {boolean} fromDeserialize
     * @param {string} opName e.g. Ops.Math.Sum
     * @example
     * // add invisible op
     * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
     */
    addOp(opIdentifier: string, uiAttribs: any, id: string, fromDeserialize: boolean, opName: string): Op;
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
    getOpsByName(name: any): Op[];
    getOpsByObjName(name: any): Op[];
    getOpsByOpId(opid: any): Op[];
    loadLib(which: any): void;
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
     * @function getVars
     * @memberof Patch
     * @instance
     * @param t
     * @return {Array<Variable>} variables
     * @function
     */
    getVars(t: any): Array<Variable>;
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
}
declare namespace Patch {
    function getOpClass(objName: any): Window;
    function replaceOpIds(json: any, options: any): any;
}
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
import { Op } from "./core_op.js";
import { Timer } from "./timer.js";
import { Profiler } from "./core_profiler.js";
import { LoadingStatus } from "./loadingstatus.js";
import { Context } from "./cgl/cgl_state.js";
import { Link } from "./core_link.js";
