/**
 * configuration object for loading a patch
 * @typedef OpUiAttribs
 * @property {string} [title] overwrite op title
 * @property {String} [title=''] overwrite title of port (by default this is portname)
 * @property {object} [storage] internal - do not use manualy
 * @property {boolean} [working] internal - do not use manualy
 * @property {boolean} [bookmarked] internal - do not use manualy
 * @property {object} [uierrors] internal - do not use manualy - use op.setUiError
 * @property {string} [color]
 * @property {string} [comment]
 * @property {object} [translate]
 * @property {string} [subpatch]
 */
export class Op extends Events {
    static OP_VERSION_PREFIX: string;
    /**
     * Description
     * @param {Patch} _patch
     * @param {String} _name
     * @param {String} _id=null
    */
    constructor(_patch: Patch, _name: string, _id?: string);
    _log: Logger;
    opId: string;
    /** @type {Array<CABLES.Port>} */
    portsOut: Array<typeof Port>;
    /** @type {Patch} */
    patch: Patch;
    data: {};
    storage: {};
    /** @type {Array<Port>} */
    portsIn: Array<Port>;
    portsInData: any[];
    /** @type {OpUiAttribs} */
    uiAttribs: OpUiAttribs;
    enabled: boolean;
    onAnimFrame: any;
    preservedPortTitles: {};
    preservedPortValues: {};
    preservedPortLinks: {};
    linkTimeRules: {
        needsLinkedToWork: any[];
        needsStringToWork: any[];
        needsParentOp: any;
    };
    shouldWork: {};
    hasUiErrors: boolean;
    /** @type {Object} */
    uiErrors: any;
    hasAnimPort: boolean;
    id: string;
    onAddPort: any;
    onCreate: any;
    onResize: any;
    onLoaded: any;
    onDelete: any;
    onError: any;
    _instances: any;
    /**
     * overwrite this to prerender shader and meshes / will be called by op `loadingStatus`
     * @function preRender
     * @memberof Op
     * @instance
     */
    preRender: any;
    /**
     * overwrite this to initialize your op
     * @function init
     * @memberof Op
     * @instance
     */
    init: any;
    /**
     * Implement to render 2d canvas based graphics from in an op - optionaly defined in op instance
     * @function renderVizLayer
     * @instance
     * @memberof Op
     * @param {ctx} context of canvas 2d
     * @param {Object} layer info
     * @param {number} layer.x x position on canvas
     * @param {number} layer.y y position on canvas
     * @param {number} layer.width width of canvas
     * @param {number} layer.height height of canvas
     * @param {number} layer.scale current scaling of patchfield view
     */
    renderVizLayer: any;
    set name(n: string);
    get name(): string;
    set _objName(on: any);
    get objName(): string;
    get shortName(): string;
    /**
     * op.require
     *
     * @param {String} name - module name
     * @returns {Object}
     */
    require(name: string): any;
    checkMainloopExists(): void;
    /** @returns {string} */
    getTitle(): string;
    /**
     * @param {string} title
     */
    setTitle(title: string): void;
    /**
     * @param {Object} newAttribs
     */
    setStorage(newAttribs: any): void;
    isSubPatchOp(): any;
    /**
     * setUiAttrib
     * possible values:
     * <pre>
     * warning - warning message - showing up in op parameter panel
     * error - error message - showing up in op parameter panel
     * extendTitle - op title extension, e.g. [ + ]
     * </pre>
     * @function setUiAttrib
     * @param {OpUiAttribs} newAttribs, e.g. {"attrib":value}
     * @memberof Op
     * @instance
     * @example
     * op.setUiAttrib({"extendTitle":str});
     */
    setUiAttrib(newAttribs: OpUiAttribs): void;
    /**
     * @deprecated
     * @param {OpUiAttribs} a
     */
    setUiAttribs(a: OpUiAttribs): void;
    /**
     * @deprecated
     * @param {OpUiAttribs} a
     */
    uiAttr(a: OpUiAttribs): void;
    /**
     * @param {OpUiAttribs} newAttribs
     */
    _setUiAttrib(newAttribs: OpUiAttribs): void;
    getName(): any;
    /**
     * @param {Port} p
     */
    addOutPort(p: Port): Port;
    hasDynamicPort(): boolean;
    addInPort(p: any): Port;
    /**
     * @deprecated
     */
    inFunction(name: any, v: any): Port;
    /**
     * create a trigger input port
     * @function inTrigger
     * @instance
     * @memberof Op
     * @param {String} v
     * @return {Port} created port
     *
     */
    inTrigger(name: any, v: string): Port;
    /**
     * create multiple UI trigger buttons
     * @function inTriggerButton
     * @memberof Op
     * @instance
     * @param {String} name
     * @param {Array} v
     * @return {Port} created port
     */
    inTriggerButton(name: string, v: any[]): Port;
    inUiTriggerButtons(name: any, v: any): Port;
    /**
     * @deprecated
     */
    inValueFloat(name: any, v: any): Port;
    /**
     * @deprecated
     */
    inValue(name: any, v: any): Port;
    /**
     * create a number value input port
     * @function inFloat
     * @memberof Op
     * @instance
     * @param {String} name
     * @param {Number} v
     * @return {Port} created port
     */
    inFloat(name: string, v: number): Port;
    /**
     * @deprecated
     */
    inValueBool(name: any, v: any): Port;
    /**
     * create a boolean input port, displayed as a checkbox
     * @function inBool
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Boolean|number} v
     * @return {Port} created port
     */
    inBool(name: string, v: boolean | number): Port;
    /**
     * @param {string} name
     * @param {number} type
     */
    inMultiPort(name: string, type: number): MultiPort;
    outMultiPort(name: any, type: any, uiAttribsPort?: {}): MultiPort;
    /**
     * @param {string} name
     * @param {string} v
     */
    inValueString(name: string, v: string): Port;
    /**
     * create a String value input port
     * @function inString
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} v default value
     * @return {Port} created port
     */
    inString(name: string, v: string): Port;
    /**
     * @param {string} name
     * @param {string} v
     */
    inTextarea(name: string, v: string): Port;
    /**
     * create a String value input port displayed as editor
     * @function inStringEditor
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} v default value
     * @param {String} syntax language
     * @param {Boolean} hideFormatButton
     * @return {Port} created port
     */
    inStringEditor(name: string, v: string, syntax: string, hideFormatButton?: boolean): Port;
    /**
     * @deprecated
     */
    inValueEditor(name: any, v: any, syntax: any, hideFormatButton?: boolean): Port;
    /**
     * @deprecated
     */
    inValueSelect(name: any, values: any, v: any, noindex: any): Port;
    /**
     * create a string select box
     * @function inDropDown
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @return {Port} created port
     */
    inDropDown(name: string, values: any[], v: string, noindex: any): Port;
    /**
     * create a string switch box
     * @function inSwitch
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @return {Port} created port
     */
    inSwitch(name: string, values: any[], v: string, noindex: any): Port;
    /**
     * @deprecated
     */
    inValueInt(name: any, v: any): Port;
    /**
     * create a integer input port
     * @function inInt
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    inInt(name: string, v: number): Port;
    /**
     * create a file/URL input port
     * @function inURL
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} filter
     * @param {String} v
     * @return {Port} created port
     */
    inFile(name: string, filter: string, v: string): Port;
    /**
     * @deprecated
     */
    inUrl(name: any, filter: any, v: any): Port;
    /**
     * create a texture input port
     * @function inTexture
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    inTexture(name: string, v: any): Port;
    /**
     * create a object input port
     * @function inObject
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    inObject(name: string, v: any, objType: any): Port;
    /**
     * @param {string} name
     * @param {string} v
     */
    inGradient(name: string, v: string): Port;
    getPortVisibleIndex(p: any): number;
    /**
     * create a array input port
     * @param {String} name
     * @param {array} v
     * @param {number} stride
     * @return {Port} created port
     */
    inArray(name: string, v: any[], stride: number): Port;
    /**
     * @deprecated
     */
    inValueSlider(name: any, v: any, min: any, max: any): Port;
    /**
     * create a value slider input port
     * @function inFloatSlider
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} v
     * @param {number} min
     * @param {number} max
     * @return {Port} created port
     */
    inFloatSlider(name: string, v: number, min: number, max: number): Port;
    /**
     * @deprecated
     */
    outFunction(name: any, v: any): Port;
    /**
     * create output trigger port
     * @function outTrigger
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    outTrigger(name: string, v: any): Port;
    /**
     * @deprecated
     */
    outValue(name: any, v: any): Port;
    /**
     * create output value port
     * @function outNumber
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    outNumber(name: string, v: number): Port;
    /**
     * @deprecated
     */
    outValueBool(name: any, v: any): Port;
    /**
     * deprecated create output boolean port
     * @deprecated
     * @function outBool
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {boolean} v default value
     * @return {Port} created port
     */
    outBool(name: string, v: boolean): Port;
    /**
     * create output boolean port,value will be converted to 0 or 1
     * @function outBoolNum
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    outBoolNum(name: string, v: any): Port;
    /**
     * @deprecated
     */
    outValueString(name: any, v: any): Port;
    /**
     * create output string port
     * @function outString
     * @instance
     * @memberof Op
     * @param {String} v
     * @return {Port} created port
     */
    outString(name: any, v: string): Port;
    /**
     * create output object port
     * @function outObject
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    outObject(name: string, v: any, objType: any): Port;
    /**
     * create output array port
     * @function outArray
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    outArray(name: string, v: any, stride: any): Port;
    /**
     * create output texture port
     * @function outTexture
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    outTexture(name: string, v: any): Port;
    /**
     * @deprecated
     */
    inDynamic(name: any, filter: any, options: any, v: any): Port;
    removeLinks(): void;
    getSerialized(): {
        opId: string;
        objName: string;
        id: string;
        uiAttribs: any;
        storage: any;
        portsIn: any[];
        portsOut: any[];
    };
    getFirstOutPortByType(type: any): typeof Port;
    getFirstInPortByType(type: any): Port;
    /**
     * return port by the name portName
     * @function getPort
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {boolean} lowerCase
     * @return {Port}
     */
    getPort(name: string, lowerCase: boolean): Port;
    /**
     * @param {string} name
     * @param {boolean} lowerCase
     * @returns {Port}
     */
    getPortByName(name: string, lowerCase?: boolean): Port;
    /**
     * return port by the name id
     * @function getPortById
     * @instance
     * @memberof Op
     * @param {String} id
     * @return {Port}
     */
    getPortById(id: string): Port;
    updateAnims(): void;
    log(...args: any[]): void;
    /**
     * @deprecated
     */
    error(...args: any[]): void;
    logError(...args: any[]): void;
    /**
     * @deprecated
     */
    warn(...args: any[]): void;
    logWarn(...args: any[]): void;
    /**
     * @deprecated
     */
    verbose(...args: any[]): void;
    logVerbose(...args: any[]): void;
    profile(): void;
    cleanUp(): void;
    instanced(triggerPort: any): boolean;
    initInstancable(): void;
    /**
     * return true if op has this error message id
     * @function hasUiError
     * @param {String} id
     * @returns {Boolean} - has id
     */
    hasUiError(id: string): boolean;
    /**
     * show op error message - set message to null to remove error message
     * @function setUiError
     * @instance
     * @memberof Op
     * @param {string} id error id
     * @param {string} txt text message
     * @param {number} level level
     */
    setUiError(id: string, txt: string, level?: number): void;
    /**
     * enable/disable op
     * @function
     * @instance
     * @memberof Op
     * @param {boolean} b
     */
    setEnabled(b: boolean): void;
    /**
     * organize ports into a group
     * @function
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} ports
     */
    setPortGroup(name: string, ports: any[]): void;
    /**
     * visually indicate ports that they are coordinate inputs
     * @function
     * @instance
     * @memberof Op
     * @param {Port} px
     * @param {Port} py
     * @param {Port} pz
     */
    setUiAxisPorts(px: Port, py: Port, pz: Port): void;
    /**
     * remove port from op
     * @function removePort
     * @instance
     * @memberof Op
     * @param {Port} port to remove
     */
    removePort(port: Port): void;
    _checkLinksNeededToWork(): void;
    /**
     * show a warning of this op is not a child of parentOpName
     * @function
     * @instance
     * @memberof Op
     * @param {String} parentOpName
     */
    toWorkNeedsParent(parentOpName: string): void;
    toWorkShouldNotBeChild(parentOpName: any, type: any): void;
    toWorkPortsNeedsString(...args: any[]): void;
    /**
     * show a small X to indicate op is not working when given ports are not linked
     * @function
     * @instance
     * @memberof Op
     * @param {Port} port1
     * @param {Port} port2
     * @param {Port} port3
     */
    toWorkPortsNeedToBeLinked(...args: any[]): void;
    toWorkPortsNeedToBeLinkedReset(): void;
    initVarPorts(): void;
    /**
     * refresh op parameters, if current op is selected
     * @function
     * @instance
     * @memberof Op
     */
    refreshParams(): void;
    /**
     * Returns true if op is selected and parameter are shown in the editor, can only return true if in editor/ui
     * @function isCurrentUiOp
     * @instance
     * @memberof Op
     * @returns {Boolean} - is current ui op
     */
    isCurrentUiOp(): boolean;
    #private;
}
/**
 * configuration object for loading a patch
 */
export type OpUiAttribs = {
    /**
     * overwrite op title
     */
    title?: string;
    /**
     * internal - do not use manualy
     */
    storage?: object;
    /**
     * internal - do not use manualy
     */
    working?: boolean;
    /**
     * internal - do not use manualy
     */
    bookmarked?: boolean;
    /**
     * internal - do not use manualy - use op.setUiError
     */
    uierrors?: object;
    color?: string;
    comment?: string;
    translate?: object;
    subpatch?: string;
};
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
import { Port } from "./core_port.js";
import { Patch } from "./core_patch.js";
import { MultiPort } from "./core_port_multi.js";
