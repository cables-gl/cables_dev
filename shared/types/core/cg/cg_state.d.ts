export class CGState extends Events {
    /**
     * Description
     * @param {Patch} _patch
     */
    constructor(_patch: Patch);
    tempData: {};
    frameStore: {};
    fpsCounter: import("./cg_fpscounter.js").default;
    _identView: any;
    _ident: any;
    _onetimeCallbacks: any[];
    maxTexSize: number;
    _viewPort: number[];
    _viewPortStack: any[];
    patch: Patch;
    autoReSize: boolean;
    DEPTH_COMPARE_FUNC_NEVER: number;
    DEPTH_COMPARE_FUNC_LESS: number;
    DEPTH_COMPARE_FUNC_EQUAL: number;
    DEPTH_COMPARE_FUNC_LESSEQUAL: number;
    DEPTH_COMPARE_FUNC_GREATER: number;
    DEPTH_COMPARE_FUNC_NOTEQUAL: number;
    DEPTH_COMPARE_FUNC_GREATEREQUAL: number;
    DEPTH_COMPARE_FUNC_ALWAYS: number;
    /**
     * Current projection matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    pMatrix: mat4;
    /**
     * Current model matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    mMatrix: mat4;
    /**
     * Current view matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    vMatrix: mat4;
    _textureslots: any[];
    _pMatrixStack: MatrixStack;
    _mMatrixStack: MatrixStack;
    _vMatrixStack: MatrixStack;
    canvasScale: number;
    get canvasWidth(): any;
    get canvasHeight(): any;
    set pixelDensity(p: number);
    get pixelDensity(): number;
    getGApiName(): string;
    get canvas(): any;
    get viewPort(): any[];
    /**
     * @param {HTMLElement} canvEle
     */
    setCanvas(canvEle: HTMLElement): void;
    cgCanvas: CgCanvas;
    updateSize(): void;
    /**
     * @param {number} w
     * @param {number} h
     * @param {boolean} ignorestyle
     */
    setSize(w: number, h: number, ignorestyle?: boolean): void;
    _resizeToWindowSize(): void;
    _resizeToParentSize(): void;
    setAutoResize(parent: any): void;
    /**
     * push a matrix to the projection matrix stack
     * @function pushPMatrix
     * @memberof Context
     * @instance
     */
    pushPMatrix(): void;
    /**
      * pop projection matrix stack
      * @function popPMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current projectionmatrix
      */
    popPMatrix(): mat4;
    getProjectionMatrixStateCount(): number;
    /**
      * push a matrix to the model matrix stack
      * @function pushModelMatrix
      * @memberof Context
      * @instance
      * @example
      * // see source code of translate op:
      * cgl.pushModelMatrix();
      * mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
      * trigger.trigger();
      * cgl.popModelMatrix();
      */
    pushModelMatrix(): void;
    /**
      * pop model matrix stack
      * @function popModelMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current modelmatrix
      */
    popModelMatrix(): mat4;
    /**
      * get model matrix
      * @function modelMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current modelmatrix
      */
    modelMatrix(): mat4;
    /**
     * push a matrix to the view matrix stack
     * @function pushviewMatrix
     * @memberof Context
     * @instance
     */
    pushViewMatrix(): void;
    /**
      * pop view matrix stack
      * @function popViewMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current viewmatrix
      * @function
      */
    popViewMatrix(): mat4;
    getViewMatrixStateCount(): number;
    /**
     * @param {vec3} identTranslate
     * @param {vec3} identTranslateView
     */
    _startMatrixStacks(identTranslate: vec3, identTranslateView: vec3): void;
    _endMatrixStacks(): void;
    dispose(): void;
    aborted: boolean;
    shouldDrawHelpers(): boolean;
    /**
     * execute the callback next frame, once
     * @function addNextFrameOnceCallback
     * @memberof Context
     * @instance
     * @param {function} cb
     */
    addNextFrameOnceCallback(cb: Function): void;
    _execOneTimeCallbacks(): void;
    checkTextureSize(x: any): any;
    screenShot(cb: any, doScreenshotClearAlpha: any, mimeType: any, quality: any): void;
    saveScreenshot(filename: any, cb: any, pw: any, ph: any, noclearalpha: any): void;
}
import { Events } from "cables-shared-client";
import Patch from "../core_patch.js";
import { MatrixStack } from "./cg_matrixstack.js";
import { CgCanvas } from "./cg_canvas.js";
