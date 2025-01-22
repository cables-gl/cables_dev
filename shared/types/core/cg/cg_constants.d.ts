export namespace CG {
    export let GAPI_WEBGL: number;
    export let GAPI_WEBGPU: number;
    export let DEPTH_COMPARE_NEVER: number;
    export let DEPTH_COMPARE_LESS: number;
    export let DEPTH_COMPARE_EQUAL: number;
    export let DEPTH_COMPARE_LESSEQUAL: number;
    export let DEPTH_COMPARE_GREATER: number;
    export let DEPTH_COMPARE_NOTEQUAL: number;
    export let DEPTH_COMPARE_GREATEREQUAL: number;
    export let DEPTH_COMPARE_ALWAYS: number;
    export let CULL_NONE: number;
    export let CULL_BACK: number;
    export let CULL_FRONT: number;
    export let CULL_BOTH: number;
    export { Geometry };
    export { BoundingBox };
    export { FpsCounter };
    export { CgCanvas };
}
import { Geometry } from "./cg_geom.js";
import { BoundingBox } from "./cg_boundingbox.js";
import FpsCounter from "./sg_fpscounter.js";
import { CgCanvas } from "./cg_canvas.js";
