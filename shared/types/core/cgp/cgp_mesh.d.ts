export default class CgpMesh extends CgMesh {
    constructor(_cgp: any, __geom: any);
    needsPipelineUpdate: boolean;
    _cgp: any;
    _geom: any;
    numIndex: number;
    instances: number;
    _pipe: Pipeline;
    _numNonIndexed: number;
    _positionBuffer: any;
    _bufVerticesIndizes: any;
    _attributes: any[];
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
    render(shader: any): void;
    #private;
}
import CgMesh from "../cg/cg_mesh.js";
import Pipeline from "./cgp_pipeline.js";
