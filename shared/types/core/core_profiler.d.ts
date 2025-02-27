export class Profiler {
    /**
     * @param {Patch} patch
     */
    constructor(patch: Patch);
    startFrame: number;
    items: {};
    currentId: any;
    currentStart: number;
    _patch: Patch;
    getItems(): {};
    clear(): void;
    togglePause(): void;
    paused: any;
    add(type: any, object: any): void;
    print(): void;
}
import { Patch } from "./core_patch.js";
