import path from "path";
import { fileURLToPath } from "url";
import cablesBuildConfig from "@cables/builder/webpack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () =>
{
    return cablesBuildConfig({
        "entry": path.join(__dirname, ".."),
        "output": {
            "path": path.join(__dirname, "dist")
        }
    });
};
