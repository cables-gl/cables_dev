export type ShaderModule = {
    title: string;
    id: number;
    numId: number;
    group: string;
    prefix: string;
    priority: number;
    srcBodyFrag: string;
    srcBodyVert: string;
};
/**
 * @typedef ShaderModule
 * @property {String} title
 * @property {Number} id
 * @property {Number} numId
 * @property {String} group
 * @property {String} prefix
 * @property {Number} priority
 * @property {String} srcBodyFrag
 * @property {String} srcBodyVert
 */
export class CgShader extends Events {
    id: number;
    _isValid: boolean;
    /** @type {Array<Array<String>>} */
    _defines: Array<Array<string>>;
    /** @type {Array<String>} */
    _moduleNames: Array<string>;
    _moduleNumId: number;
    _needsRecompile: boolean;
    _compileReason: string;
    /** @type {Array<ShaderModule>} */
    _modules: Array<ShaderModule>;
    _compileCount: number;
    /**
     * @param {string} reason
     */
    setWhyCompile(reason: string): void;
    getWhyCompile(): string;
    needsRecompile(): boolean;
    /**
     * easily enable/disable a define without a value
     * @param {String} name
     * @param {Port} enabled value or port
     */
    toggleDefine(name: string, enabled: Port): void;
    /**
     * add a define to a shader, e.g.  #define DO_THIS_THAT 1
     * @param {String} name
     * @param {any} value (can be empty)
     */
    define(name: string, value?: any): void;
    getDefines(): string[][];
    /**
     * @param {string} name
     */
    getDefine(name: string): string;
    /**
     * return true if shader has define
     * @function hasDefine
     * @memberof Shader
     * @instance
     * @param {String} name
     * @return {Boolean}
     */
    hasDefine(name: string): boolean;
    /**
     * remove a define from a shader
     * @param {string} name
     */
    removeDefine(name: string): void;
    /**
     * @param {any} modId
     */
    hasModule(modId: any): boolean;
    /**
     *
     * @param {Array<String>} names
     */
    setModules(names: Array<string>): void;
    /**
     * remove a module from shader
     * @param {ShaderModule} mod the module to be removed
     */
    removeModule(mod: ShaderModule): void;
    getNumModules(): number;
    getCurrentModules(): ShaderModule[];
    /**
     * add a module
     * @param {ShaderModule} mod the module to be added
     * @param {ShaderModule} [sibling] sibling module, new module will share the same group
     */
    addModule(mod: ShaderModule, sibling?: ShaderModule): ShaderModule;
}
import { Events } from "cables-shared-client";
import { Port } from "../core_port.js";
