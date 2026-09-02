import ele from "./src/ele.js";
import helper from "./src/helper.js";
import Events from "./src/eventtarget.js";
import TalkerAPI from "./src/talkerapi.js";
import Logger from "./src/logger.js";
import ModalBackground from "./src/modalbg.js";
import HandlebarsHelper from "./src/handlebars.js";
import CablesConstants from "./client_contstants.js";
import BuildWatcher from "../buildwatcher.js";

export {
    helper,
    ele,
    Events,
    TalkerAPI,
    Logger,
    ModalBackground,
    HandlebarsHelper,
    CablesConstants,
    BuildWatcher
};

/**
 * @typedef OpDoc
 * @property {String} id
 * @property {String} name
 * @property {String} content
 * @property {String} shortName
 * @property {String} shortNameDisplay
 * @property {String} authorName
 * @property {String} exampleProjectId
 * @property {String[]} libs
 * @property {String[]} corelibs
 * @property {String[]} attachmentFiles
 * @property {String[]} youtubeids
 * @property {String} summary
 * @property {Number} version
 * @property {Number} created
 * @property {Object} [layout]
 * @property {Boolean} userOp
 * @property {Boolean} isReleased
 * @property {Boolean} hasExample
 * @property {Boolean} oldVersion
 * @property {Boolean} allowEdit
 * @property {Boolean} isExtended
 */
