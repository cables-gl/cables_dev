import writeFileAtomic from "write-file-atomic";
import mkdirp from "mkdirp";
import path from "path";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedStorageUtil extends SharedUtil
{

    get utilName()
    {
        return UtilProvider.STORAGE_UTIL;
    }

    /**
     *
     * @param {String} filename
     * @param {any} data
     */
    writeFileSync(filename, data)
    {
        mkdirp(path.dirname(filename));
        writeFileAtomic.sync(filename, data);
    }

    /**
     *
     * @param {String} filename
     * @param {any} data
     * @param {Number} [spaces=4]
     * @param {(this: any, key: string, value: any) => any} [replacer]
     * @returns
     */
    writeJsonFileSync(filename, data, spaces = 4, replacer = null)
    {
        mkdirp(path.dirname(filename));
        const json = JSON.stringify(data, replacer, spaces);
        return writeFileAtomic.sync(filename, json);
    }

}
