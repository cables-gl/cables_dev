import path from "path";
import { fileURLToPath } from "url";
import cablesBuildConfig from "./src/webpack/webpack.config.js";

export default () =>
{
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const genDir = path.resolve(__dirname, "../../gen/");

    const entry = path.join(genDir, "builder", "export");
    const buildDir = path.join(entry, "_build");

    const buildConfig = cablesBuildConfig({
        "mode": "production",
        "entry": entry,
        "output": {
            "path": path.join(genDir, "build")
        },
        "options": {
            "coreFile": path.join(buildDir, "cables.js"),
            "libsDir": path.join(buildDir, "libs"),
            "corelibsDir": path.join(buildDir, "corelibs")
        }
    });
    return buildConfig;
};
