export default class Mesh {
    constructor(_cgp: any, __geom: any);
    bla: any;
    _log: Logger;
    _cgp: any;
    _geom: any;
    numIndex: number;
    instances: number;
    _pipe: Pipeline;
    _numNonIndexed: number;
    _positionBuffer: any;
    _bufVerticesIndizes: any;
    _attributes: any[];
    _needsPipelineUpdate: boolean;
    _createBuffer(device: any, data: any, usage: any): any;
    /**
     * @function setGeom
     * @memberof Mesh
     * @instance
     * @description set geometry for mesh
     * @param {Geometry} geom geometry
     * @param {boolean} removeRef
     */
    setGeom(geom: Geometry, removeRef: boolean): void;
    _numIndices: any;
    _indicesBuffer: any;
    _disposeAttributes(): void;
    dispose(): void;
    /**
     * @function setAttribute
     * @description update attribute
     * @memberof Mesh
     * @instance
     * @param {String} name attribute name
     * @param {Array} array data
     * @param {Number} itemSize
     * @param {Object} options
     */
    setAttribute(name: string, array: any[], itemSize: number, options?: any): {
        buffer: any;
        name: string;
        instanced: boolean;
    };
    render(): void;
}
import { Logger } from "cables-shared-client";
import Pipeline from "./cgp_pipeline.js";
