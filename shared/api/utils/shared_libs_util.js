import fs from "fs";
import path from "path";

import sanitizeFileName from "sanitize-filename";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedLibsUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
    }

    get utilName()
    {
        return UtilProvider.LIBS_UTIL;
    }

    libExists(libName)
    {
        let existsLib = false;
        if (typeof libName === "string")
        {
            libName = sanitizeFileName(libName);
            const libFilename = this._cables.getLibsPath() + libName;
            existsLib = fs.existsSync(libFilename);
        }
        return existsLib;
    }
}

