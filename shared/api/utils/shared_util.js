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
     * @param {UtilProvider} utilProvider
     * @param {boolean} [register=true]
     */
    constructor(utilProvider, register = true)
    {
        if (utilProvider)
        {

            /** @type {UtilProvider} */
            this._utilProvider = utilProvider;
            if (register) this._utilProvider.register(this.utilName, this);
        }
    }

    /**
     * @abstract
     * @returns {string}
     */
    get utilName()
    {
        return "not implemented, abstract class";
    }

    /**
     *
     * @returns {import("./shared_logger.js").default}
     * @protected
     */
    get _log()
    {
        return this._utilProvider.getUtil(UtilProvider.LOGGER);
    }

    /**
     *
     * @returns {import("../cables.js").default}
     * @protected
     */
    get _cables()
    {
        return this._utilProvider.getUtil(UtilProvider.CABLES);
    }

    /**
     *
     * @returns {import("./shared_ops_util.js").default}
     * @protected
     */
    get _opsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.OPS_UTIL);
    }

    /**
     *
     * @returns {import("./shared_doc_util.js").default}
     * @protected
     */
    get _docsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.DOCS_UTIL);
    }

    /**
     *
     * @returns {import("./shared_subpatchop_util.js").default}
     * @protected
     */
    get _subPatchOpUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.SUBPATCH_OP_UTIL);
    }

    /**
     *
     * @return {import("./shared_teams_util.js").default}
     * @protected
     */
    get _teamsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.TEAMS_UTIL);
    }

    /**
     *
     * @return {import("./shared_helper_util.js").default}
     * @protected
     */
    get _helperUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.HELPER_UTIL);
    }

    /**
     *
     * @return {import("./shared_projects_util.js").default}
     * @protected
     */
    get _projectsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.PROJECTS_UTIL);
    }

    /**
     *
     * @return {import("./shared_libs_util.js").default}
     * @protected
     */
    get _libsUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.LIBS_UTIL);
    }

    /**
     *
     * @return {import("./shared_files_util.js").default}
     * @protected
     */
    get _filesUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.FILES_UTIL);
    }

    /**
     *
     * @return {import("./shared_storage_util.js").default}
     * @protected
     */
    get _storageUtil()
    {
        return this._utilProvider.getUtil(UtilProvider.STORAGE_UTIL);
    }
}
