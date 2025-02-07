/**
 * A Texture
 * @namespace external:CGL
 * @class
 * @param {Context} __cgl cgl
 * @param {Object} options
 * @hideconstructor
 * @example
 * // generate a 256x256 pixel texture of random colors
 * const size=256;
 * const data = new Uint8Array(size*size*4);
 *
 * for(var x=0;x<size*size*4;x++) data[ x*4+3]=255;
 *
 * const tex=new CGL.Texture(cgl);
 * tex.initFromData(data,size,size,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT);
 */
export class Texture extends CgTexture {
    constructor(__cgl: any, options?: {});
    _log: Logger;
    _cgl: any;
    tex: any;
    loading: boolean;
    flip: unknown;
    flipped: boolean;
    shadowMap: unknown;
    deleted: boolean;
    image: any;
    anisotropic: unknown;
    filter: unknown;
    wrap: unknown;
    texTarget: any;
    textureType: unknown;
    unpackAlpha: unknown;
    _fromData: boolean;
    _glDataType: number;
    _glInternalFormat: number;
    _glDataFormat: number;
    isFloatingPoint(): any;
    /**
     * returns true if otherTexture has same options (width/height/filter/wrap etc)
     * @function compareSettings
     * @memberof Texture
     * @instance
     * @param {Texture} tex otherTexture
     * @returns {Boolean}
     */
    compareSettings(tex: Texture): boolean;
    /**
     * returns a new texture with the same settings (does not copy texture itself)
     * @function clone
     * @memberof Texture
     * @instance
     * @returns {Texture}
     */
    clone(): Texture;
    setFormat(o: any): void;
    /**
     * set pixel size of texture
     * @function setSize
     * @memberof Texture
     * @instance
     * @param {Number} w width
     * @param {Number} h height
     */
    setSize(w: number, h: number): void;
    shortInfoString: string;
    /**
     * @function initFromData
     * @memberof Texture
     * @instance
     * @description create texturem from rgb data
     * @param {Array<Number>} data rgb color array [r,g,b,a,r,g,b,a,...]
     * @param {Number} w width
     * @param {Number} h height
     * @param {Number} filter
     * @param {Number} wrap
     */
    initFromData(data: Array<number>, w: number, h: number, filter: number, wrap: number): void;
    updateMipMap(): void;
    /**
     * set texture data from an image/canvas object
     * @function initTexture
     * @memberof Texture
     * @instance
     * @param {Object} img image
     * @param {Number} filter
     */
    initTexture(img: any, filter: number): void;
    /**
     * delete texture. use this when texture is no longer needed
     * @function delete
     * @memberof Texture
     * @instance
     */
    dispose(): void;
    delete(): void;
    /**
     * @function isPowerOfTwo
     * @memberof Texture
     * @instance
     * @description return true if texture width and height are both power of two
     * @return {Boolean}
     */
    isPowerOfTwo(): boolean;
    printInfo(): void;
    getInfoReadable(): string;
    getInfoOneLine(): string;
    getInfoOneLineShort(): string;
    getInfo(): {
        name: any;
        "power of two": any;
        size: string;
        target: any;
        unpackAlpha: any;
        cubemap: boolean;
        textureType: string;
        wrap: string;
        filter: string;
        pixelFormat: any;
    };
    _setFilter(): void;
}
export namespace Texture {
    /**
     * @function load
     * @static
     * @memberof Texture
     * @description load an image from an url
     * @param {Context} cgl
     * @param {String} url
     * @param {Function} finishedCallback
     * @param {Object} settings
     * @return {Texture}
     */
    function load(cgl: Context, url: string, finishedCallback: Function, settings: any): Texture;
    /**
     * @static
     * @function getTempTexture
     * @memberof Texture
     * @description returns the default temporary texture (grey diagonal stipes)
     * @param {Context} cgl
     * @return {Texture}
     */
    function getTempTexture(cgl: Context): Texture;
    /**
     * @static
     * @function getErrorTexture
     * @memberof Texture
     * @description returns the default temporary texture (grey diagonal stipes)
     * @param {Context} cgl
     * @return {Texture}
     */
    function getErrorTexture(cgl: Context): Texture;
    /**
     * @function getEmptyTexture
     * @memberof Texture
     * @instance
     * @param cgl
     * @param fp
     * @description returns a reference to a small empty (transparent) texture
     * @return {Texture}
     */
    function getEmptyTexture(cgl: any, fp: any): Texture;
    /**
     * @function getEmptyTextureFloat
     * @memberof Texture
     * @instance
     * @param cgl
     * @description returns a reference to a small empty (transparent) 32bit texture
     * @return {Texture}
     */
    function getEmptyTextureFloat(cgl: any): Texture;
    /**
     * @function getRandomTexture
     * @memberof Texture
     * @static
     * @param cgl
     * @description returns a reference to a random texture
     * @return {Texture}
     */
    function getRandomTexture(cgl: any): Texture;
    /**
     * @function getRandomFloatTexture
     * @memberof Texture
     * @static
     * @param cgl
     * @description returns a reference to a texture containing random numbers between -1 and 1
     * @return {Texture}
     */
    function getRandomFloatTexture(cgl: any): Texture;
    /**
     * @function getBlackTexture
     * @memberof Texture
     * @static
     * @param cgl
     * @description returns a reference to a black texture
     * @return {Texture}
     */
    function getBlackTexture(cgl: any): Texture;
    /**
     * @function getEmptyCubemapTexture
     * @memberof Texture
     * @static
     * @param cgl
     * @description returns an empty cubemap texture with rgba = [0, 0, 0, 0]
     * @return {Texture}
     */
    function getEmptyCubemapTexture(cgl: any): Texture;
    function getTempGradientTexture(cgl: any): Texture;
    function getTemporaryTexture(cgl: any, size: any, filter: any, wrap: any, r: any, g: any, b: any): Texture;
    /**
     * @static
     * @function createFromImage
     * @memberof Texture
     * @description create texturem from image data (e.g. image or canvas)
     * @param {Context} cgl
     * @param {Object} img image
     * @param {Object} options
     */
    function createFromImage(cgl: Context, img: any, options: any): Texture;
    function fromImage(cgl: any, img: any, filter: any, wrap: any): Texture;
    /**
     * @static
     * @function isPowerOfTwo
     * @memberof Texture
     * @description returns true if x is power of two
     * @param {Number} x
     * @return {Boolean}
     */
    function isPowerOfTwo(x: number): boolean;
    function getTexInfo(tex: any): {
        name: any;
        "power of two": any;
        size: string;
        target: any;
        unpackAlpha: any;
        cubemap: boolean;
        textureType: string;
        wrap: string;
        filter: string;
        pixelFormat: any;
    };
    function setUpGlPixelFormat(cgl: any, pixelFormatStr: any): {
        pixelFormatBase: any;
        pixelFormat: any;
        glDataType: any;
        glInternalFormat: any;
        glDataFormat: any;
        numColorChannels: number;
    };
    function getPixelFormatNumChannels(pxlFrmtStr: any): 1 | 2 | 3 | 4;
    function isPixelFormatFloat(pxlFrmtStr: any): any;
    function isPixelFormatHalfFloat(pxlFrmtStr: any): any;
}
import CgTexture from "../cg/cg_texture.js";
import { Logger } from "cables-shared-client";
