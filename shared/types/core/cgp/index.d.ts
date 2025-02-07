export namespace CGP {
    export { WebGpuContext as Context };
    export { Shader };
    export { Mesh };
    export { Pipeline };
    export { Texture };
    export { Binding };
    export { Uniform };
    export { MESHES };
    export { GPUBuffer };
}
import { WebGpuContext } from "./cgp_state.js";
import Shader from "./cgp_shader.js";
import Mesh from "./cgp_mesh.js";
import Pipeline from "./cgp_pipeline.js";
import Texture from "./cgp_texture.js";
import Binding from "./cgp_binding.js";
import Uniform from "./cgp_uniform.js";
import { MESHES } from "../cgl/cgl_simplerect.js";
import GPUBuffer from "./cgp_gpubuffer.js";
