/**
 * @namespace external:CABLES#Link
 * @description a link is a connection between two ops/ports -> one input and one output port
 * @hideconstructor
 * @class
 */
export class Link extends Events {
    /**
     * @param {{Patch}} p
     */
    constructor(p: {
        Patch: any;
    });
    id: number;
    /**
     * @type {Port}
     */
    portIn: Port;
    /**
     * @type {Port}
     */
    portOut: Port;
    /**
     * @type {Patch}
     */
    _patch: Patch;
    activityCounter: number;
    ignoreInSerialize: boolean;
    setValue(v: any): void;
    activity(): void;
    _setValue(): void;
    /**
     * @function getOtherPort
     * @memberof Link
     * @instance
     * @param {Port} p port
     * @description returns the port of the link, which is not port
     */
    getOtherPort(p: Port): Port;
    /**
     * @function remove
     * @memberof Link
     * @instance
     * @description unlink/remove this link from all ports
     */
    remove(): void;
    /**
     * @function link
     * @memberof Link
     * @instance
     * @description link those two ports
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    link(p1: Port, p2: Port): boolean;
    getSerialized(): {
        portIn: any;
        portOut: any;
        objIn: string;
        objOut: string;
    };
}
export namespace Link {
    /**
     * @function canLinkText
     * @memberof Link
     * @instance
     * @description return a text message with human readable reason if ports can not be linked, or can be
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    function canLinkText(p1: Port, p2: Port): string;
    /**
     * @function canLink
     * @memberof Link
     * @instance
     * @description return true if ports can be linked
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     * @returns {Boolean}
     */
    function canLink(p1: Port, p2: Port): boolean;
}
import { Events } from "cables-shared-client";
import { Port } from "./core_port.js";
import Patch from "./core_patch.js";
