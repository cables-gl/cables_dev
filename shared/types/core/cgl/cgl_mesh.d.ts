/**
 * webgl renderable 3d object
 * @class
 * @namespace external:CGL
 * @hideconstructor
 * @example
 * const cgl=this._cgl
 * const mesh=new CGL.Mesh(cgl, geometry);
 *
 * function render()
 * {
 *   mesh.render(cgl.getShader());
 * }
 *
 */
export class Mesh extends CgMesh {
    /**
     * @param {Context} _cgl cgl
     * @param {Geometry} __geom geometry
     * @param {Number} _options glPrimitive
     */
    constructor(_cgl: Context, __geom: Geometry, _options: number);
    _cgl: Context;
    _log: Logger;
    _bufVertexAttrib: {
        buffer: any;
        name: string;
        cb: any;
        itemSize: number;
        numItems: number;
        startItem: number;
        instanced: boolean;
        type: any;
    };
    _bufVerticesIndizes: any;
    _indexType: any;
    _attributes: any[];
    _attribLocs: {};
    _lastShader: any;
    _numInstances: number;
    _glPrimitive: any;
    opId: any;
    _preWireframeGeom: Geometry;
    addVertexNumbers: boolean;
    feedBackAttributes: any[];
    _feedBacks: any[];
    _feedBacksChanged: boolean;
    _transformFeedBackLoc: number;
    _lastAttrUpdate: number;
    memFreed: boolean;
    _queryExt: any;
    set numInstances(v: number);
    get numInstances(): number;
    freeMem(): void;
    /**
     * @function updateVertices
     * @memberof Mesh
     * @instance
     * @description update vertices only from a geometry
     * @param {Geometry} geom
     */
    updateVertices(geom: Geometry): void;
    _numVerts: number;
    setAttributePointer(attrName: any, name: any, stride: any, offset: any): void;
    getAttribute(name: any): any;
    setAttributeRange(attr: any, array: any, start: any, end: any): void;
    _resizeAttr(array: any, attr: any): void;
    _bufferArray(array: any, attr: any): void;
    /**
     * @function setAttribute
     * @description update attribute
     * @memberof Mesh
     * @instance
     * @param {String} name
     * @param {Array} array
     * @param {Number} itemSize
     * @param {Object} options
     */
    addAttribute(name: string, array: any[], itemSize: number, options: any): void;
    /**
     * @param {String} name
     * @param {Array} array
     * @param {Number} itemSize Integer
     * @param {Object} options
     */
    setAttribute(name: string, array: any[], itemSize: number, options: any): any;
    getAttributes(): any[];
    /**
     * @function updateTexCoords
     * @description update texture coordinates only from a geometry
     * @memberof Mesh
     * @instance
     * @param {Geometry} geom
     */
    updateTexCoords(geom: Geometry): void;
    /**
     * @function updateNormals
     * @description update normals only from a geometry
     * @memberof Mesh
     * @instance
     * @param {Geometry} geom
     */
    updateNormals(geom: Geometry): void;
    /**
     * @param {Array} arr
     */
    _setVertexNumbers(arr: any[]): void;
    _verticesNumbers: any[] | Float32Array<ArrayBuffer>;
    /**
     * @function setVertexIndices
     * @description update vertex indices / faces
     * @memberof Mesh
     * @instance
     * @param {array} vertIndices
     */
    setVertexIndices(vertIndices: any[]): void;
    vertIndicesTyped: Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | (any[] & Uint32Array<ArrayBuffer>) | (any[] & Uint16Array<ArrayBuffer>);
    /**
     * @function setGeom
     * @memberof Mesh
     * @instance
     * @description set geometry for mesh
     * @param {Geometry} geom
     * @param {boolean} removeRef
     */
    setGeom(geom: Geometry, removeRef?: boolean): void;
    _preBind(shader: any): void;
    _checkAttrLengths(): void;
    _bind(shader: any): void;
    unBind(): void;
    meshChanged(): boolean;
    printDebug(shader: any): void;
    setNumVertices(num: any): void;
    getNumVertices(): number;
    /**
     * @function render
     * @memberof Mesh
     * @instance
     * @description draw mesh to screen
     * @param {Shader} shader
     */
    render(shader: Shader): void;
    setNumInstances(n: any): void;
    _disposeAttributes(): void;
    dispose(): void;
    #private;
}
export namespace MESH {
    let lastMesh: any;
}
import CgMesh from "../cg/cg_mesh.js";
import { Context } from "./cgl_state.js";
import { Logger } from "cables-shared-client";
import { Geometry } from "../cg/cg_geom.js";
