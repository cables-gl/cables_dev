import Talker from "../libs/talker.cjs";
import Events from "./eventtarget.js";

/**
 * wrapper for talkerapi to communicate ui <-> backend even in iframed setups
 *
 * @name TalkerAPI
 * @extends {Events}
 */
export default class TalkerAPI extends Events
{
    // events
    static EVENT_SCREENSHOT_SAVED = "screenshotSaved";
    static EVENT_PATCH = "patch";

    // common
    static CMD_GET_OP_DOCS = "getOpDocs";
    static CMD_REQUEST_PATCH_DATA = "requestPatchData";
    static CMD_GET_OP_INFO = "getOpInfo";
    static CMD_GET_CABLES_CHANGELOG = "getChangelog";
    static CMD_UPDATE_FILE = "updateFile";
    static CMD_TOGGLE_PATCH_FAVS = "toggleFav";
    static CMD_CHECK_PATCH_UPDATED = "checkProjectUpdated";
    static CMD_CREATE_PATCH_BACKUP = "patchCreateBackup";
    static CMD_RELOAD_PATCH = "reload";
    static CMD_SAVE_PATCH = "savePatch";
    static CMD_GET_PATCH = "getPatch";
    static CMD_GET_PATCH_SUMMARY = "getPatchSummary";
    static CMD_GOTO_PATCH = "gotoPatch";
    static CMD_CREATE_NEW_PATCH = "newPatch";
    static CMD_SAVE_PATCH_AS = "saveProjectAs";
    static CMD_SAVE_PATCH_SCREENSHOT = "saveScreenshot";
    static CMD_SET_PATCH_NAME = "setProjectName";
    static CMD_UPDATE_PATCH_NAME = "updatePatchName";
    static CMD_SET_ICON_SAVED = "setIconSaved";
    static CMD_SET_ICON_UNSAVED = "setIconUnsaved";
    static CMD_GET_FILE_LIST = "getFilelist";
    static CMD_CONVERT_FILE = "fileConvert";
    static CMD_GET_FILE_DETAILS = "getFileDetails";
    static CMD_GET_LIBRARYFILE_DETAILS = "getLibraryFileInfo";
    static CMD_DELETE_FILE = "deleteFile";
    static CMD_GET_ASSET_USAGE_COUNT = "checkNumAssetPatches";
    static CMD_CREATE_NEW_FILE = "createFile";
    static CMD_UPLOAD_FILE = "fileUploadStr";
    static CMD_UPLOAD_OP_DEPENDENCY = "uploadFileToOp";
    static CMD_GET_PROJECT_OPS = "getAllProjectOps";
    static CMD_GET_ALL_OPDOCS = "getOpDocsAll";
    static CMD_GET_COLLECTION_OPDOCS = "getCollectionOpDocs";
    static CMD_CREATE_OP = "opCreate";
    static CMD_SAVE_OP_CODE = "saveOpCode";
    static CMD_GET_OP_CODE = "getOpCode";
    static CMD_FORMAT_OP_CODE = "formatOpCode";
    static CMD_SAVE_OP_LAYOUT = "opSaveLayout";
    static CMD_ADD_OP_LIBRARY = "opAddLib";
    static CMD_REMOVE_OP_LIBRARY = "opRemoveLib";
    static CMD_ADD_OP_CORELIB = "opAddCoreLib";
    static CMD_REMOVE_OP_CORELIB = "opRemoveCoreLib";
    static CMD_CLONE_OP = "opClone";
    static CMD_UPDATE_OP = "opUpdate";
    static CMD_ADD_OP_ATTACHMENT = "opAttachmentAdd";
    static CMD_GET_OP_ATTACHMENT = "opAttachmentGet";
    static CMD_REMOVE_OP_ATTACHMENT = "opAttachmentDelete";
    static CMD_SAVE_OP_ATTACHMENT = "opAttachmentSave";
    static CMD_SAVE_USER_SETTINGS = "saveUserSettings";
    static CMD_TOGGLE_MULTIPLAYER_SESSION = "toggleMultiplayerSession";
    static CMD_CHECK_OP_NAME = "checkOpName";
    static CMD_GET_RECENT_PATCHES = "getRecentPatches";
    static CMD_ADD_OP_DEPENDENCY = "addOpDependency";
    static CMD_REMOVE_OP_DEPENDENCY = "removeOpDependency";
    static CMD_SEND_ERROR_REPORT = "errorReport";
    static CMD_SEND_PATCH = "sendPatch";

    // notify ui
    static CMD_UI_REFRESH_FILEMANAGER = "refreshFileManager";
    static CMD_UI_JOB_START = "jobStart";
    static CMD_UI_JOB_PROGRESS = "jobProgress";
    static CMD_UI_JOB_FINISH = "jobFinish";
    static CMD_UI_NOTIFY = "notify";
    static CMD_UI_NOTIFY_ERROR = "notifyError";
    static CMD_UI_FILE_UPDATED = "fileUpdated";
    static CMD_UI_FILE_DELETED = "fileDeleted";
    static CMD_UI_LOG_ERROR = "logError";
    static CMD_UI_OPS_DELETED = "opsDeleted";
    static CMD_UI_OP_RENAMED = "opRenamed";
    static CMD_UI_CLOSE_RENAME_DIALOG = "closeRenameDialog";
    static CMD_UI_SET_SAVED_STATE = "setSavedState";
    static CMD_UI_SETTING_MANUAL_SCREENSHOT = "manualScreenshot";
    static CMD_EXECUTE_OP = "executeOp";

    // electron
    static CMD_ELECTRON_RENAME_OP = "opRename";
    static CMD_ELECTRON_DELETE_OP = "opDelete";
    static CMD_ELECTRON_SET_OP_SUMMARY = "opSetSummary";
    static CMD_ELECTRON_GET_PROJECT_OPDIRS = "getProjectOpDirs";
    static CMD_ELECTRON_OPEN_DIR = "openDir";
    static CMD_ELECTRON_SELECT_FILE = "selectFile";
    static CMD_ELECTRON_SELECT_DIR = "selectDir";
    static CMD_ELECTRON_COLLECT_ASSETS = "collectAssets";
    static CMD_ELECTRON_COLLECT_OPS = "collectOps";
    static CMD_ELECTRON_SAVE_PROJECT_OPDIRS_ORDER = "saveProjectOpDirOrder";
    static CMD_ELECTRON_REMOVE_PROJECT_OPDIR = "removeProjectOpDir";
    static CMD_ELECTRON_EXPORT_PATCH = "exportPatch";
    static CMD_ELECTRON_EXPORT_PATCH_BUNDLE = "exportPatchBundle";
    static CMD_ELECTRON_ADD_PROJECT_OPDIR = "addProjectOpDir";
    static CMD_ADD_OP_PACKAGE = "addOpPackage";

    constructor(target)
    {
        super();

        // eslint-disable-next-line no-undef
        this._talker = new Talker.default(target, "*");
        this._callbackCounter = 0;
        this._callbacks = {};

        this._talker.onMessage = (msg) =>
        {
            if (msg.data && msg.data.cmd) // other messages are not for talkerapi, i.e. anything that somehow is sent via .postMessage
            {
                if (msg.data.cmd === "callback")
                {
                    if (this._callbacks[msg.data.cb]) this._callbacks[msg.data.cb](msg.data.error, msg.data.response);
                }
                else
                {
                    if (!this.hasListenerForEventName(msg.data.cmd))
                    {
                        console.error("TalkerAPI has no listener for", msg.data.cmd);
                    }
                    this.emitEvent(msg.data.cmd, msg.data.data, (error, r) =>
                    {
                        this._talker.send("cables", { "cmd": "callback", "cb": msg.data.cb, "response": r, "error": error });
                    });
                }
            }
        };
    }

    /**
     * send message via cables-talkerapi
     * @param {string} cmd name of the event
     * @param {object} data payload
     * @param {function} [callback]
     */
    send(cmd, data, callback)
    {
        const payload = { "cmd": cmd, "data": data };
        if (callback)
        {
            this._callbackCounter++;
            this._callbacks[this._callbackCounter] = callback;
            payload.cb = this._callbackCounter;
        }

        this._talker.send("cables", payload);
    }
}
