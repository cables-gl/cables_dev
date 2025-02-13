export class CgShader extends Events {
    id: number;
    _isValid: boolean;
    _defines: any[];
    _moduleNames: any[];
    _modules: any[];
    _moduleNumId: number;
    _needsRecompile: boolean;
    _compileReason: string;
    setWhyCompile(reason: any): void;
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
    getDefines(): any[];
    getDefine(name: any): any;
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
    hasModule(modId: any): boolean;
    setModules(names: any): void;
    /**
     * remove a module from shader
     * @param {ShaderModule} mod the module to be removed
     */
    removeModule(mod: ShaderModule): void;
    getNumModules(): number;
    getCurrentModules(): any[];
    /**
     * add a module
     * @param {shaderModule} mod the module to be added
     * @param {shaderModule} [sibling] sibling module, new module will share the same group
     */
    addModule(mod: shaderModule, sibling?: shaderModule): shaderModule;
    getAttributeSrc(mod: any, srcHeadVert: any, srcVert: any): {
        srcHeadVert: any;
        srcVert: any;
    };
    replaceModuleSrc(): void;
}
import { Events } from "cables-shared-client";
import Port from "../core_port.js";
