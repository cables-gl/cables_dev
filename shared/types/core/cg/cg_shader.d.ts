export class CgShader extends Events {
    id: number;
    _isValid: boolean;
    _defines: any[];
    _moduleNames: any[];
    _modules: any[];
    _moduleNumId: number;
    /**
     * easily enable/disable a define without a value
     * @function toggleDefine
     * @memberof Shader
     * @instance
     * @param {name} name
     * @param {any} enabled value or port
     */
    toggleDefine(name: void, enabled: any): void;
    /**
     * add a define to a shader, e.g.  #define DO_THIS_THAT 1
     * @function define
     * @memberof Shader
     * @instance
     * @param {String} name
     * @param {Any} value (can be empty)
     */
    define(name: string, value: Any): void;
    _needsRecompile: boolean;
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
     * @param {name} name
     * @function removeDefine
     * @memberof Shader
     * @instance
     */
    removeDefine(name: void): void;
    hasModule(modId: any): boolean;
    setModules(names: any): void;
    /**
     * remove a module from shader
     * @function removeModule
     * @memberof Shader
     * @instance
     * @param {shaderModule} mod the module to be removed
     */
    removeModule(mod: shaderModule): void;
    getNumModules(): number;
    getCurrentModules(): any[];
    /**
     * add a module
     * @function addModule
     * @memberof Shader
     * @instance
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
