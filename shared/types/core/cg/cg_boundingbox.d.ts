/**
 * bounding box
 *
 * @namespace external:CGL
 * @param {Geometry} geometry or bounding box
 */
export class BoundingBox {
    /**
     * @param {Geometry} geom
     */
    constructor(geom: Geometry);
    _first: boolean;
    _wireMesh: any;
    _init(): void;
    _max: number[];
    _min: number[];
    _center: number[];
    _size: number[];
    _maxAxis: number;
    /**
     * get biggest number of maxX,maxY,maxZ
     * @type {Number}
     */
    get maxAxis(): number;
    /**
     * size of bounding box
     * @type {vec3}
     */
    get size(): vec3;
    /**
     * center of bounding box
     * @type {vec3}
     */
    get center(): vec3;
    /**
     * center x
     * @type {Number}
     */
    get x(): number;
    /**
     * center y
     * @type {Number}
     */
    get y(): number;
    /**
     * center z
     * @type {Number}
     */
    get z(): number;
    /**
     * minimum x
     * @type {Number}
     */
    get minX(): number;
    /**
     * minimum y
     * @type {Number}
     */
    get minY(): number;
    /**
     * minimum z
     * @type {Number}
     */
    get minZ(): number;
    /**
     * maximum x
     * @type {Number}
     */
    get maxX(): number;
    /**
     * maximum y
     * @type {Number}
     */
    get maxY(): number;
    /**
     * maximum z
     * @type {Number}
     */
    get maxZ(): number;
    apply(geom: any, mat: any): void;
    /**
     * returns a copy of the bounding box
     * @function copy
     * @memberof BoundingBox
     * @instance
     */
    copy(): BoundingBox;
    get changed(): boolean;
    applyPos(x: any, y: any, z: any): void;
    calcCenterSize(): void;
    mulMat4(m: any): void;
    render(cgl: any, shader: any, op: any): void;
}
import Geometry from "./cg_geom.js";
