/**
 * a geometry contains all information about a mesh, vertices, texturecoordinates etc. etc.
 * @namespace external:CGL#Geometry
 * @param {String} name
 * @class
 * @example
 * // create a triangle with all attributes
 * const geom=new Geometry("triangle"),
 *
 * geom.vertices = [
 *      0.0,           sizeH.get(),  0.0,
 *     -sizeW.get(),  -sizeH.get(),  0.0,
 *      sizeW.get(),  -sizeH.get(),  0.0 ];
 *
 * geom.vertexNormals = [
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0 ];
 *
 * geom.tangents = [
 *     1,0,0,
 *     1,0,0,
 *     1,0,0 ];
 *
 * geom.biTangents = [
 *     0,1,0,
 *     0,1,0,
 *     0,1,0 ];
 *
 * geom.texCoords = [
 *      0.5,  0.0,
 *      1.0,  1.0,
 *      0.0,  1.0, ];
 *
 * geom.verticesIndices = [
 *     0, 1, 2 ];
 *
 */
export class Geometry {
    constructor(name: any);
    name: any;
    _log: Logger;
    faceVertCount: number;
    glPrimitive: any;
    _attributes: {};
    _vertices: any[];
    verticesIndices: any[];
    isGeometry: boolean;
    morphTargets: any[];
    set vertices(v: any[]);
    get vertices(): any[];
    set texCoords(v: any);
    get texCoords(): any;
    set vertexNormals(v: any);
    get vertexNormals(): any;
    set tangents(v: any);
    get tangents(): any;
    set biTangents(v: any);
    get biTangents(): any;
    set vertexColors(v: any);
    get vertexColors(): any;
    /**
     * @function clear
     * @memberof Geometry
     * @instance
     * @description clear all buffers/set them to length 0
     */
    clear(): void;
    /**
     * @function getAttributes
     @memberof Geometry
    * @instance
    * @return {Array<Object>} returns array of attribute objects
    */
    getAttributes(): Array<any>;
    /**
     * @function getAttribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @return {Object}
     */
    getAttribute(name: string): any;
    /**
     * @function setAttribute
     * @description create an attribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @param {Array} arr
     * @param {Number} itemSize
     */
    setAttribute(name: string, arr: any[], itemSize: number): void;
    copyAttribute(name: any, newgeom: any): void;
    /**
     * @function setVertices
     * @memberof Geometry
     * @instance
     * @description set vertices
     * @param {Array|Float32Array} arr [x,y,z,x,y,z,...]
     */
    setVertices(arr: any[] | Float32Array): void;
    /**
     * @function setTexCoords
     * @memberof Geometry
     * @instance
     * @description set texcoords
     * @param {Array|Float32Array} arr [u,v,u,v,...]
     */
    setTexCoords(arr: any[] | Float32Array): void;
    calcNormals(smooth: any): void;
    /**
     * @function flipNormals
     * @memberof Geometry
     * @param x
     * @param y
     * @param z
     * @description flip normals
     */
    flipNormals(x: any, y: any, z: any): void;
    getNumTriangles(): number;
    /**
     * @function flipVertDir
     * @memberof Geometry
     * @description flip order of vertices in geom faces
     */
    flipVertDir(): void;
    setPointVertices(verts: any): void;
    /**
     * merge a different geometry into the this geometry
     * @function merge
     * @param {Geometry} geom
     * @memberof Geometry
     * @instance
     */
    merge(geom: Geometry): void;
    /**
     *   a copy of the geometry
     * @function copy
     * @memberof Geometry
     * @instance
     */
    copy(): Geometry;
    /**
     * Calculaten normals
     * @function calculateNormals
     * @memberof Geometry
     * @param options
     * @instance
     */
    calculateNormals(options: any): void;
    getVertexVec: (which: any) => number[];
    /**
     * Calculates tangents & bitangents with the help of uv-coordinates. Adapted from
     * Lengyel, Eric. “Computing Tangent Space Basis Vectors for an Arbitrary Mesh”.
     * Terathon Software 3D Graphics Library.
     * https://fenix.tecnico.ulisboa.pt/downloadFile/845043405449073/Tangent%20Space%20Calculation.pdf
     *
     * @function calcTangentsBitangents
     * @memberof Geometry
     * @instance
     */
    calcTangentsBitangents(): void;
    isIndexed(): boolean;
    /**
     * @function unIndex
     * @memberof Geometry
     * @instance
     * @description remove all vertex indizes, vertices array will contain 3*XYZ for every triangle
     * @param {boolean} reIndex
     * @param {boolean} dontCalcNormals
     */
    unIndex(reIndex: boolean, dontCalcNormals: boolean): void;
    calcBarycentric(): void;
    getBounds(): BoundingBox;
    center(x: any, y: any, z: any): number[];
    mapTexCoords2d(): void;
    getInfoOneLine(): string;
    getInfo(): {
        numFaces: number;
        indices: number;
        numVerts: number;
        numNormals: number;
        numTexCoords: number;
        numTangents: number;
        numBiTangents: number;
        numVertexColors: number;
        numAttribs: number;
        isIndexed: boolean;
    };
}
export namespace Geometry {
    function buildFromFaces(arr: any, name: any, optimize: any): Geometry;
}
import { Logger } from "cables-shared-client";
import { BoundingBox } from "./cg_boundingbox.js";
