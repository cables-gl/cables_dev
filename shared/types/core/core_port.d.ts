/**
 * data is coming into and out of ops through input and output ports
 * @namespace external:CABLES#Port
 * @module Port
 * @class
 * @hideconstructor
 * @param ___op
 * @param name
 * @param type
 * @param uiAttribs
 * @example
 * const myPort=op.inString("String Port");
 */
declare class Port extends Events {
    static TYPE_VALUE: number;
    static TYPE_NUMBER: number;
    static TYPE_FUNCTION: number;
    static TYPE_TRIGGER: number;
    static TYPE_OBJECT: number;
    static TYPE_TEXTURE: number;
    static TYPE_ARRAY: number;
    static TYPE_DYNAMIC: number;
    static TYPE_STRING: number;
    /**
     * @param {Op} ___op
     * @param {string} name
     * @param {number} type
     * @param {Object} uiAttribs
     */
    constructor(___op: Op, name: string, type: number, uiAttribs: any);
    data: {};
    _log: Logger;
    /**
     * @type {Number}
     * @name direction
     * @instance
     * @memberof Port
     * @description direction of port (input(0) or output(1))
     */
    direction: number;
    id: string;
    /** @type {Op} */
    _op: Op;
    /** @type {Array<Link>} */
    links: Array<Link>;
    /** @type {any} */
    value: any;
    name: string;
    /** @type {number} */
    type: number;
    uiAttribs: any;
    /** @type {Anim} */
    anim: Anim;
    defaultValue: any;
    _uiActiveState: boolean;
    ignoreValueSerialize: boolean;
    onLinkChanged: any;
    crashed: boolean;
    _valueBeforeLink: any;
    _lastAnimFrame: number;
    _animated: boolean;
    onValueChanged: any;
    onTriggered: () => void;
    onUiActiveStateChange: any;
    changeAlways: boolean;
    forceRefChange: boolean;
    _useVariableName: any;
    activityCounter: number;
    apf: number;
    activityCounterStartFrame: number;
    _tempLastUiValue: any;
    get parent(): Op;
    get title(): any;
    get op(): Op;
    set val(v: any);
    get val(): any;
    /**
     * copy over a uiattrib from an external connected port to another port
     * @function copyLinkedUiAttrib
     * @memberof Port
     * @param {string} which attrib name
     * @param {Port} port source port
     * @instance
     * @example
     *
     *  inArray.onLinkChanged=()=>
     *  {
     *      if(inArray) inArray.copyLinkedUiAttrib("stride", outArray);
     *  };
     */
    copyLinkedUiAttrib(which: string, port: Port): void;
    getValueForDisplay(): any;
    /**
     * change listener for input value ports, overwrite to react to changes
     * @function onChange
     * @memberof Port
     * @instance
     * @example
     * const myPort=op.inString("MyPort");
     * myPort.onChange=function()
     * {
     *   console.log("was changed to: ",myPort.get());
     * }
     *
     */
    onAnimToggle(): void;
    _onAnimToggle(): void;
    /**
     * @function remove
     * @memberof Port
     * @instance
     * @description remove port
     */
    remove(): void;
    /**
     * set ui attributes
     * @function setUiAttribs
     * @memberof Port
     * @instance
     * @param {Object} newAttribs
     * <pre>
     * title - overwrite title of port (by default this is portname)
     * greyout - port paramater will appear greyed out, can not be
     * hidePort - port will be hidden from op
     * hideParam - port params will be hidden from parameter panel
     * showIndex - only for dropdowns - show value index (e.g. `0 - normal` )
     * editorSyntax - set syntax highlighting theme for editor port
     * ignoreObjTypeErrors - do not auto check object types
     * </pre>
     * @example
     * myPort.setUiAttribs({greyout:true});
     */
    setUiAttribs(newAttribs: any): void;
    /**
     * get ui attributes
     * @function getUiAttribs
     * @memberof Port
     * @example
     * myPort.getUiAttribs();
     */
    getUiAttribs(): any;
    /**
     * get ui attribute
     * @function getUiAttrib
     * @memberof Port
     * @instance
     * @param {String} attribName
     * <pre>
     * attribName - return value of the ui-attribute, or null on unknown attribute
     * </pre>
     * @example
     * myPort.setUiAttribs("values");
     */
    getUiAttrib(attribName: string): any;
    /**
     * @function get
     * @memberof Port
     * @instance
     * @description get value of port
     */
    get(): any;
    setRef(v: any): void;
    /**
     * @function setValue
     * @memberof Port
     * @instance
     * @description set value of port / will send value to all linked ports (only for output ports)
     */
    set(v: any): void;
    setValue(v: any): void;
    updateAnim(): void;
    forceChange(): void;
    /**
     * @function getTypeString
     * @memberof Port
     * @instance
     * @description get port type as string, e.g. "Function","Value"...
     * @return {String} type
     */
    getTypeString(): string;
    deSerializeSettings(objPort: any): void;
    setInitialValue(v: any): void;
    getSerialized(): {
        name: string;
    };
    shouldLink(): boolean;
    /**
     * @function removeLinks
     * @memberof Port
     * @instance
     * @description remove all links from port
     */
    removeLinks(): void;
    /**
     * @function removeLink
     * @memberof Port
     * @instance
     * @description remove all link from port
     * @param {Link} link
     */
    removeLink(link: Link): void;
    /**
     * @function getName
     * @memberof Port
     * @instance
     * @description return port name
     */
    getName(): string;
    /**
     * @function getTitle
     * @memberof Port
     * @instance
     * @description return port name or title
     */
    getTitle(): any;
    addLink(l: any): void;
    /**
     * @function getLinkTo
     * @memberof Port
     * @instance
     * @param {Port} p2 otherPort
     * @description return link, which is linked to otherPort
     */
    getLinkTo(p2: Port): Link;
    /**
     * @function removeLinkTo
     * @memberof Port
     * @instance
     * @param {Port} p2 otherPort
     * @description removes link, which is linked to otherPort
     */
    removeLinkTo(p2: Port): void;
    /**
     * @function isLinkedTo
     * @memberof Port
     * @instance
     * @param {Port} p2 otherPort
     * @description returns true if port is linked to otherPort
     */
    isLinkedTo(p2: Port): boolean;
    _activity(): void;
    /**
     * @function trigger
     * @memberof Port
     * @instance
     * @description trigger the linked port (usually invoked on an output function port)
     */
    trigger(): void;
    call(): void;
    execute(): void;
    setVariableName(n: any): void;
    getVariableName(): any;
    setVariable(v: any): void;
    _variableIn: any;
    _varChangeListenerId: any;
    _handleNoTriggerOpAnimUpdates(a: any): void;
    _notriggerAnimUpdate: any;
    /**
     * @param {boolean} a
     */
    setAnimated(a: boolean): void;
    toggleAnim(): void;
    /**
     * <pre>
     * CABLES.Port.TYPE_VALUE = 0;
     * CABLES.Port.TYPE_FUNCTION = 1;
     * CABLES.Port.TYPE_OBJECT = 2;
     * CABLES.Port.TYPE_TEXTURE = 2;
     * CABLES.Port.TYPE_ARRAY = 3;
     * CABLES.Port.TYPE_DYNAMIC = 4;
     * CABLES.Port.TYPE_STRING = 5;
     * </pre>
     * @function getType
     * @memberof Port
     * @instance
     * @return {Number} type of port
     */
    getType(): number;
    /**
     * @function isLinked
     * @memberof Port
     * @instance
     * @return {Boolean} true if port is linked
     */
    isLinked(): boolean;
    isBoundToVar(): boolean;
    /**
     * @function isAnimated
     * @memberof Port
     * @instance
     * @return {Boolean} true if port is animated
     */
    isAnimated(): boolean;
    /**
     * @function isHidden
     * @memberof Port
     * @instance
     * @return {Boolean} true if port is hidden
     */
    isHidden(): boolean;
    /**
     * @function onTriggered
     * @memberof Port
     * @instance
     * @param {function} a onTriggeredCallback
     * @description set callback, which will be executed when port was triggered (usually output port)
     */
    _onTriggered(a: Function): void;
    _onSetProfiling(v: any): void;
    _onTriggeredProfiling(): void;
    getUiActiveState(): boolean;
    setUiActiveState(onoff: any): void;
    /**
     * @deprecated
     * @param {function} cb
     */
    onValueChange(cb: Function): void;
    onChange: Function;
    /**
     * @deprecated
     */
    hidePort(): void;
    #private;
}
declare namespace Port {
    /**
     * Returns the port type string, e.g. "value" based on the port type number
     * @function portTypeNumberToString
     * @instance
     * @memberof Port
     * @param {Number} type - The port type number
     * @returns {String} - The port type as string
     */
    function portTypeNumberToString(type: number): string;
}
export default Port;
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
import Op from "./core_op.js";
import Link from "./core_link.js";
import Anim from "./anim.js";
