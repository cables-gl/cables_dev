import { performance } from "node:perf_hooks";
import fs from "fs";
import vm from "vm";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";

const FRAME_MS = 1000 / 60;

export class CablesHeadlessRunner
{

    #OPS_JS_LOCATION = "ops.js";
    #CABLES_JS_LOCATION = "cables.js";

    #packageFile;
    #packageJson;
    #patchFile;
    #opsFile;
    #cablesFile;

    constructor(packageFile = "package.json")
    {
        this.log = console;
        this.#packageFile = path.resolve(packageFile);
        this.#packageJson = JSON.parse(fs.readFileSync(this.#packageFile, "utf8"));
        const baseDir = path.dirname(this.#packageFile);
        this.#patchFile = path.join(baseDir, this.#packageJson.cables.patch);
        const jsDir = path.dirname(this.#patchFile);
        this.#opsFile = path.join(jsDir, this.#OPS_JS_LOCATION);
        this.#cablesFile = path.join(jsDir, this.#CABLES_JS_LOCATION);
    }

    async run()
    {

        const headlessWindow = /** @type {any} */ (globalThis);
        const windowEvents = new EventTarget();
        headlessWindow.window = headlessWindow;
        headlessWindow.addEventListener = windowEvents.addEventListener.bind(windowEvents);
        headlessWindow.removeEventListener = windowEvents.removeEventListener.bind(windowEvents);
        headlessWindow.dispatchEvent = windowEvents.dispatchEvent.bind(windowEvents);
        headlessWindow.requestAnimationFrame = (cb) => { return setTimeout(() => { cb(performance.now()); }, FRAME_MS); };
        headlessWindow.cancelAnimationFrame = (id) => { clearTimeout(id); };

        const nodeRequire = createRequire(this.#packageFile);

        const baseDir = path.dirname(this.#packageFile);
        const missingModules = Object.keys(this.#packageJson.dependencies || {}).filter((name) =>
        {
            return !fs.existsSync(path.join(baseDir, "node_modules", name, "package.json"));
        });
        if (missingModules.length > 0)
        {
            this.log.warn("\x1b[33mmissing npm dependencies: " + missingModules.join(", ") + " - run \"npm install\" in " + baseDir + " first\x1b[0m");
            return {
                "success": false,
            };
        }

        const cablesCode = fs.readFileSync(this.#cablesFile, "utf8");
        const cables = new vm.Script(cablesCode, { "filename": path.basename(this.#cablesFile) });
        cables.runInThisContext();

        CABLES.Op.prototype.require = function (name) { return nodeRequire(name); };

        for (const lib of this.#packageJson.cables.libs || [])
        {
            if (lib.src.startsWith("http"))
            {
                this.log.error("can not load remote library " + lib.src + " in headless mode");
                continue;
            }
            const libFile = path.join(baseDir, lib.src);
            if (lib.type === "module")
            {
                const mod = await import(pathToFileURL(libFile).href);
                window[lib.export] = mod;
            }
            else
            {
                const libCode = fs.readFileSync(libFile, "utf8");
                new vm.Script(libCode, { "filename": lib.src }).runInThisContext();
            }
        }

        const opsCode = fs.readFileSync(this.#opsFile, "utf8");
        const ops = new vm.Script(opsCode, { "filename": path.basename(this.#opsFile) });
        ops.runInThisContext();
        window.Ops = Ops;

        const patchJson = fs.readFileSync(this.#patchFile);
        new CABLES.Patch({
            "patch": patchJson.toString(),
            "silent": true,
            "onError": (...args) =>
            {
                this.log.error(...args);
            }
        });
        return {
            "success": true,
        };
    }
}

new CablesHeadlessRunner().run().then((result) =>
{
    if (!result.success) process.exit(1);
});
