import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedUtil
{
    /**
     *
     * @param {UtilProvider} utilProvider
     */
    constructor(utilProvider)
    {
        if (utilProvider)
        {
            this._utilProvider = utilProvider;
            this._utilProvider.register(this.utilName, this);
        }
    }

    /**
     * @abstract
     */
    // eslint-disable-next-line getter-return,no-empty-function
    get utilName() {}

    /**
     *
     * @return {*}
     * @protected
     */
    get _log()
    {
        return this._utilProvider.getUtil(UtilProvider.LOGGER);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _cables()
    {
        return this._utilProvider.getUtil(UtilProvider.CABLES);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _opsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.OPS_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _docsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.DOCS_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _subPatchOpUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.SUBPATCH_OP_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _teamsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.TEAMS_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _helperUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.HELPER_UTIL);
    }
}
