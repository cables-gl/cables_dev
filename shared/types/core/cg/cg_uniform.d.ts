export class CgUniform {
    /**
     * Description
     * @param {CgShader} __shader
     * @param {string} __type
     * @param {string} __name
     * @param {Number|Port} _value
     * @param {Port} _port2
     * @param {Port} _port3
     * @param {Port} _port4
     */
    constructor(__shader: CgShader, __type: string, __name: string, _value: number | Port, _port2: Port, _port3: Port, _port4: Port);
    _log: Logger;
    _type: string;
    _name: string;
    _shader: CgShader;
    _value: any;
    _oldValue: any;
    _port: Port;
    needsUpdate: boolean;
    shaderType: any;
    comment: any;
    set: any;
    setValue: any;
    updateValue: any;
    _port2: Port;
    _port3: Port;
    _port4: Port;
    getType(): string;
    get type(): string;
    get name(): string;
    getName(): string;
    getValue(): any;
    getShaderType(): any;
    isStructMember(): boolean;
    updateFromPort4f(): void;
    updateFromPort3f(): void;
    updateFromPort2f(): void;
    updateFromPort(): void;
}
import { Logger } from "cables-shared-client";
import { CgShader } from "./cg_shader.js";
import { Port } from "../core_port.js";
