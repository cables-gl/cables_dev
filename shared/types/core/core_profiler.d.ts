export class Profiler {
    constructor(patch: any);
    startFrame: any;
    items: {};
    currentId: any;
    currentStart: number;
    _patch: any;
    getItems(): {};
    clear(): void;
    togglePause(): void;
    paused: any;
    add(type: any, object: any): void;
    print(): void;
}
