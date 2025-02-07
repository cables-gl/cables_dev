/**
 * LoadingStatus class, manages asynchronous loading jobs
 *
 * @namespace external:CABLES#LoadingStatus
 * @hideconstructor
 * @class
 * @param patch
 */
export class LoadingStatus extends Events {
    constructor(patch: any);
    _log: Logger;
    _loadingAssets: {};
    _cbFinished: any[];
    _assetTasks: any[];
    _percent: number;
    _count: number;
    _countFinished: number;
    _order: number;
    _startTime: number;
    _patch: any;
    _wasFinishedPrinted: boolean;
    _loadingAssetTaskCb: boolean;
    setOnFinishedLoading(cb: any): void;
    getNumAssets(): number;
    getProgress(): number;
    checkStatus(): void;
    getList(): any[];
    getListJobs(): any[];
    print(): void;
    finished(id: any): any;
    _startAssetTasks(): void;
    /**
     * delay an asset loading task, mainly to wait for ui to be finished loading and showing, and only then start loading assets
     * @function addAssetLoadingTask
     * @instance
     * @memberof LoadingStatus
     * @param {function} cb callback
     */
    addAssetLoadingTask(cb: Function): void;
    existByName(name: any): boolean;
    start(type: any, name: any, op: any): string;
}
import { Events } from "cables-shared-client";
import { Logger } from "cables-shared-client";
