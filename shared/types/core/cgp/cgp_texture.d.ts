declare class Texture extends CgTexture {
    constructor(_cgp: any, options?: {});
    _log: Logger;
    _cgp: any;
    gpuTexture: any;
    gpuTextureDescriptor: {
        size: {
            width: any;
            height: any;
        };
        format: string;
        usage: number;
    };
    samplerDesc: {
        addressModeU: any;
        addressModeV: any;
        magFilter: any;
        minFilter: any;
    };
    setSize(w: any, h: any): void;
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
        name: any;
        size: string;
        textureType: any;
    };
    createView(): any;
    getSampler(): {
        addressModeU: any;
        addressModeV: any;
        magFilter: any;
        minFilter: any;
    };
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
}
declare namespace Texture {
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
export default Texture;
import CgTexture from "../cg/cg_texture.js";
import { Logger } from "cables-shared-client";
