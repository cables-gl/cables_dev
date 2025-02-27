/**
 * @typedef {Object} CglTextureOptions
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [pixelformat]
 */
export class CgTexture {
    /**
     * @param {CglTextureOptions} options={}
     */
    constructor(options?: CglTextureOptions);
    id: string;
    width: number;
    height: number;
    name: any;
    pixelFormat: any;
}
export namespace CgTexture {
    function getDefaultTextureData(name: any, size: any, options?: {}): any;
    let FILTER_NEAREST: number;
    let FILTER_LINEAR: number;
    let FILTER_MIPMAP: number;
    let WRAP_REPEAT: number;
    let WRAP_MIRRORED_REPEAT: number;
    let WRAP_CLAMP_TO_EDGE: number;
    let TYPE_DEFAULT: number;
    let TYPE_DEPTH: number;
    let TYPE_FLOAT: number;
    let PFORMATSTR_RGB565: string;
    let PFORMATSTR_R8UB: string;
    let PFORMATSTR_RG8UB: string;
    let PFORMATSTR_RGB8UB: string;
    let PFORMATSTR_RGBA8UB: string;
    let PFORMATSTR_SRGBA8: string;
    let PFORMATSTR_R11FG11FB10F: string;
    let PFORMATSTR_R16F: string;
    let PFORMATSTR_RG16F: string;
    let PFORMATSTR_RGB16F: string;
    let PFORMATSTR_RGBA16F: string;
    let PFORMATSTR_R32F: string;
    let PFORMATSTR_RG32F: string;
    let PFORMATSTR_RGB32F: string;
    let PFORMATSTR_RGBA32F: string;
    let PFORMATSTR_DEPTH: string;
    let PIXELFORMATS: string[];
}
export type CglTextureOptions = {
    width?: number;
    height?: number;
    pixelformat?: string;
};
