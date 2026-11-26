import { BuildUtil } from "@cables/builder";
import utilProvider, { UtilProvider } from "./util_provider.js";

export default class SharedBuildUtil extends BuildUtil
{

    /**
     *
     * @param {UtilProvider} provider
     */
    constructor(provider)
    {
        super();
        this._utilProvider = provider;
        this._utilProvider.register(UtilProvider.BUILD_UTIL, this);
    }

    get _log()
    {
        return this._utilProvider.getUtil(UtilProvider.LOGGER) || console;
    }
}

new SharedBuildUtil(utilProvider);
