export class Texture extends CgTexture {
    /**
    * @param {CgpContext} _cgp
    * @param {Object} options={}
    */
    constructor(_cgp: CgpContext, options?: any);
    gpuTexture: any;
    gpuTextureDescriptor: any;
    name: string;
    textureType: string;
    samplerDesc: {};
    /**
     * @param {Number} w
     * @param {Number} h
     */
    setSize(w: number, h: number): void;
    /**
     * set texture data from an image/canvas object
     * @function initTexture
     * @memberof Texture
     * @instance
     * @param {Object} img image
     * @param {Number} filter
     */
    initTexture(img: any, filter: number): any;
    dispose(): void;
    getInfo(): {
        name: string;
        size: string;
        textureType: string;
    };
    createView(): any;
    getSampler(): {};
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
    setWrap(v: any): void;
    setFilter(v: any): void;
    #private;
}
export namespace Texture {
    /**
     * @function load
     * @static
     * @memberof Texture
     * @description load an image from an url
     * @param {Context} cgp
     * @param {String} url
     * @param {Function} onFinished
     * @param {Object} settings
     * @return {Texture}
     */
    function load(cgp: Context, url: string, onFinished: Function, settings: any): Texture;
}
import { CgTexture } from "../cg/cg_texture.js";
import { CgpContext } from "./cgp_state.js";
