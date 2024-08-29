import { UtilProvider } from "./util_provider.js";

/**
 * abstract class for cables utils
 *
 * @param {UtilProvider} utilProvider
 * @abstract
 */
export default class SharedUtil
{
    /**
     *
     *
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

    /**
     *
     * @return {*}
     * @protected
     */
    get _projectsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.PROJECTS_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _libsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.LIBS_UTIL);
    }

    /**
     *
     * @return {*}
     * @protected
     */
    get _filesUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.FILES_UTIL);
    }
}
