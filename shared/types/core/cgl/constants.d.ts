export namespace CONSTANTS {
    export namespace MATH {
        export { DEG2RAD };
        export { RAD2DEG };
    }
    export { SHADER };
    export { BLEND_MODES };
}
declare const DEG2RAD: number;
declare const RAD2DEG: number;
declare namespace SHADER {
    let SHADERVAR_VERTEX_POSITION: string;
    let SHADERVAR_VERTEX_NUMBER: string;
    let SHADERVAR_VERTEX_NORMAL: string;
    let SHADERVAR_VERTEX_TEXCOORD: string;
    let SHADERVAR_INSTANCE_MMATRIX: string;
    let SHADERVAR_VERTEX_COLOR: string;
    let SHADERVAR_INSTANCE_INDEX: string;
    let SHADERVAR_UNI_PROJMAT: string;
    let SHADERVAR_UNI_VIEWMAT: string;
    let SHADERVAR_UNI_MODELMAT: string;
    let SHADERVAR_UNI_NORMALMAT: string;
    let SHADERVAR_UNI_INVVIEWMAT: string;
    let SHADERVAR_UNI_INVPROJMAT: string;
    let SHADERVAR_UNI_MATERIALID: string;
    let SHADERVAR_UNI_OBJECTID: string;
    let SHADERVAR_UNI_VIEWPOS: string;
}
declare namespace BLEND_MODES {
    let BLEND_NONE: number;
    let BLEND_NORMAL: number;
    let BLEND_ADD: number;
    let BLEND_SUB: number;
    let BLEND_MUL: number;
}
export {};
