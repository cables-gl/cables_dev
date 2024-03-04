// hallo1234
import mkdirp from "mkdirp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import SharedUtil from "./utils/shared_util.js";
import { UtilProvider } from "./utils/util_provider.js";

/**
 * @abstract
 */
export default class Cables extends SharedUtil
{
    constructor(utilProvider, dirName = null, writableDirName = null)
    {
        super(utilProvider);
        this._dirname = dirName || fileURLToPath(new URL(".", import.meta.url).pathname);
        this._writeableDirName = writableDirName || this._dirname;
        this.configLocation = path.resolve(this._dirname, "../cables.json");

        this._config = this.getConfig();
        this._createDirectories();

        const packageJsonFile = path.join(this.getSourcePath(), "../package.json");
        if (fs.existsSync(packageJsonFile))
        {
            const pjson = JSON.parse(fs.readFileSync(packageJsonFile));
            if (pjson && pjson.engines && pjson.engines.node)
            {
                const wantedVersion = pjson.engines.node;
                if (process && process.versions && process.versions.node)
                {
                    const runningVersion = process.versions.node;
                    if (wantedVersion !== runningVersion)
                    {
                        this._log.error("NODE VERSION MISMATCH, WANTED", wantedVersion, "GOT", runningVersion);
                    }
                }
                else
                {
                    this._log.warn("COULD NOT DETERMINE RUNNING NODE VERSION FROM process, WANTED VERSION IS", wantedVersion);
                }
            }
            else
            {
                this._log.warn("COULD NOT DETERMINE WANTED NODE VERSION FROM package.json");
            }
        }
    }

    get utilName()
    {
        return UtilProvider.CABLES;
    }

    getConfig()
    {
        if (!this._config)
        {
            if (process.env.npm_config_apiconfig) this.configLocation = path.resolve("./cables_env_" + process.env.npm_config_apiconfig + ".json");

            if (!fs.existsSync(this.configLocation))
            {
                try
                {
                    fs.copySync(path.resolve("./cables_example.json"), this.configLocation);
                }
                catch (err)
                {
                    this._log.error(err);
                }
            }

            this._config = JSON.parse(fs.readFileSync(this.configLocation, "utf-8"));
            this._config.maxFileSizeMb = this._config.maxFileSizeMb || 256;
        }
        return this._config;
    }


    getUserOpsPath()
    {
        if (!this._config.path.userops) return path.join(this.getOpsPath(), "/users/");
        return this._config.path.userops.startsWith("/") ? this._config.path.userops : path.join(this._writeableDirName, this._config.path.userops);
    }

    getTeamOpsPath()
    {
        if (!this._config.path.teamops) return path.join(this.getOpsPath(), "/teams/");
        return this._config.path.teamops.startsWith("/") ? this._config.path.teamops : path.join(this._writeableDirName, this._config.path.teamops);
    }

    getExtensionOpsPath()
    {
        if (!this._config.path.extensionops) return path.join(this.getOpsPath(), "/extensions/");
        return this._config.path.extensionops.startsWith("/") ? this._config.path.extensionops : path.join(this._writeableDirName, this._config.path.extensionops);
    }

    getPatchOpsPath()
    {
        if (!this._config.path.patchops) return path.join(this.getOpsPath(), "/patches/");
        return this._config.path.patchops.startsWith("/") ? this._config.path.patchops : path.join(this._writeableDirName, this._config.path.patchops);
    }

    getCoreOpsPath()
    {
        return path.join(this.getOpsPath(), "/base/");
    }


    getSourcePath()
    {
        return path.join(this._dirname);
    }

    getUiPath()
    {
        if (this._config.path.ui) return path.join(this._dirname, this._config.path.ui);
        return path.join(this._dirname, "../../cables_ui/");
    }

    getUiDistPath()
    {
        if (this._config.path.uiDist) return path.join(this._dirname, this._config.path.uiDist);
        return path.join(this.getUiPath(), "/dist/");
    }

    getOpsPath()
    {
        if (!this._config.path.ops) this._log.error("no path.ops found in cables.json!");
        return path.join(this._dirname, "/", this._config.path.ops);
    }

    getLibsPath()
    {
        if (!this._config.path.libs) this._log.error("no path.libs found in cables.json!");
        return path.join(this._dirname, "/", this._config.path.libs);
    }

    getCoreLibsPath()
    {
        if (!this._config.path.corelibs) this._log.error("no path.corelibs found in cables.json!");
        return path.join(this._dirname, "/", this._config.path.corelibs);
    }

    getGenPath()
    {
        return path.join(this._writeableDirName, "gen/");
    }

    getOpDocsFile()
    {
        return this.getGenPath() + "opdocs.json";
    }

    getOpLookupFile()
    {
        return this.getGenPath() + "oplookup.json";
    }

    getOpDocsCachePath()
    {
        return path.join(this.getGenPath(), "opdocs_collections/");
    }

    getFeedPath()
    {
        return path.join(this._writeableDirName, "/../public/gen/feed/");
    }

    getPublicPath()
    {
        return path.join(this._dirname, "/../public/");
    }

    getApiPath()
    {
        return path.join(this._dirname, "/../");
    }

    getAssetPath()
    {
        let dirName = path.join(this._writeableDirName, "/", this._config.path.assets);
        if (this._config.path.assets.startsWith("/")) dirName = this._config.path.assets;
        return dirName;
    }

    getAssetLibraryPath()
    {
        return path.join(this.getAssetPath(), "/library");
    }

    getViewsPath()
    {
        return path.join(this._dirname, "/../views/");
    }

    getElectronPath()
    {
        if (this._config.path.electron)
        {
            return path.join(this._dirname, this._config.path.electron);
        }
        return false;
    }

    getDocsMdPath()
    {
        if (this._config.path.docs_md)
        {
            return path.join(this.getSourcePath(), this._config.path.docs_md);
        }
        return false;
    }

    isLocal()
    {
        return this._config.url.includes("local");
    }

    isLive()
    {
        return this._config.env === "live";
    }

    isDevEnv()
    {
        return this._config.env === "dev";
    }

    isNightly()
    {
        return this._config.env === "nightly";
    }

    getEnv()
    {
        return this._config.env;
    }

    _createDirectories()
    {
        if (!fs.existsSync(this.getAssetPath())) mkdirp(this.getAssetPath());
        if (!fs.existsSync(this.getLibsPath())) mkdirp(this.getLibsPath());
        if (!fs.existsSync(this.getCoreLibsPath())) mkdirp(this.getCoreLibsPath());
        if (!fs.existsSync(this.getAssetLibraryPath())) mkdirp.sync(this.getAssetLibraryPath());

        if (!fs.existsSync(this.getGenPath())) mkdirp.sync(this.getGenPath());

        if (!fs.existsSync(this.getOpDocsFile()))
        {
            if (!fs.existsSync(this.getOpDocsFile())) fs.writeFileSync(this.getOpDocsFile(), JSON.stringify({ "generated": Date.now(), "opDocs": [] }));
        }

        if (!fs.existsSync(this.getFeedPath())) mkdirp.sync(this.getFeedPath());
        if (!fs.existsSync(this.getOpDocsFile())) fs.writeFileSync(this.getOpDocsFile(), JSON.stringify({}));
        if (!fs.existsSync(this.getOpLookupFile())) fs.writeFileSync(this.getOpLookupFile(), JSON.stringify({ "names": {}, "ids": {} }));

        if (!fs.existsSync(this.getOpsPath())) mkdirp(this.getOpsPath());
        if (!fs.existsSync(this.getUserOpsPath())) mkdirp.sync(this.getUserOpsPath());
        if (!fs.existsSync(this.getTeamOpsPath())) mkdirp.sync(this.getTeamOpsPath());
        if (!fs.existsSync(this.getExtensionOpsPath())) mkdirp.sync(this.getExtensionOpsPath());
        if (!fs.existsSync(this.getPatchOpsPath())) mkdirp.sync(this.getPatchOpsPath());
        if (!fs.existsSync(this.getOpDocsCachePath())) mkdirp.sync(this.getOpDocsCachePath());
    }
}
