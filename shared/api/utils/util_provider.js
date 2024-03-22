class UtilProvider
{
    constructor()
    {
        this._utils = {};
    }

    getUtil(name)
    {
        return this._utils[name];
    }

    register(name, that)
    {
        const logger = this.getUtil(UtilProvider.LOGGER);
        if (logger) logger.info("registering", that.constructor.name, "as", name);
        this._utils[name] = that;
    }
}
UtilProvider.CABLES = "cables";
UtilProvider.DOCS_UTIL = "docsUtil";
UtilProvider.HELPER_UTIL = "helperUtil";
UtilProvider.LOGGER = "logger";
UtilProvider.OPS_UTIL = "opsUtil";
UtilProvider.SUBPATCH_OP_UTIL = "subPatchOpUtil";
UtilProvider.TEAMS_UTIL = "teamsUtil";
UtilProvider.PROJECTS_UTIL = "projectsUtil";
UtilProvider.FILES_UTIL = "filesUtil";

export { UtilProvider };
export default new UtilProvider();
