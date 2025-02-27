export namespace CGP {
    export { CgpContext as Context };
    export { CgpShader as Shader };
    export { CgpMesh as Mesh };
    export { Pipeline };
    export { Texture };
    export { Binding };
    export { CgpUniform as Uniform };
    export { MESHES };
    export { CgpGguBuffer as GPUBuffer };
}
import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";
import { Pipeline } from "./cgp_pipeline.js";
import { Texture } from "./cgp_texture.js";
import { Binding } from "./cgp_binding.js";
import { CgpUniform } from "./cgp_uniform.js";
import { MESHES } from "../cgl/cgl_simplerect.js";
import { CgpGguBuffer } from "./cgp_gpubuffer.js";
