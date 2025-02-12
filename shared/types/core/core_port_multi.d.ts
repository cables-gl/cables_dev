export class MultiPort extends Port {
    constructor(__parent: any, name: any, type: any, dir: any, uiAttribs: any, uiAttribsPorts: any);
    ports: any[];
    direction: any;
    _uiAttribsPorts: any;
    removeInvalidPorts: () => void;
    countPorts: () => void;
    retryTo: number;
    removeListeners: () => void;
    addListeners: () => void;
    newPort: () => Port;
    initPorts: () => void;
    checkNum: () => void;
    incDec: (incDir: any) => void;
    toggleManual: () => void;
}
import Port from "./core_port.js";
