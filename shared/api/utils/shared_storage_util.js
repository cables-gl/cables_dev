import SharedUtil from "./shared_util.js";
import writeFileAtomic from "write-file-atomic";
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

    writeFileSync(fileName, data)
    {
        return writeFileAtomic.sync(fileName, data);
    }

    writeJsonFileSync(filename, data, spaces = 4, replacer = null)
    {
        const json = JSON.stringify(data, replacer, spaces);
        return writeFileAtomic.sync(filename, json);
    }

}
