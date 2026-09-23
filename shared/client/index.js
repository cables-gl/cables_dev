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
 * @typedef ApiErrorData
 * @property {string} msg
 * @deprecated @property {string} stderr
 * @property {string} [opName]
 */

/**
 * @typedef ApiError
 * @property {string} msg
 * @property {number} code
 * @property {ApiErrorData} data
 */

/**
 * @typedef ApiPagination
 * @property {Number} count
 * @property {Number} offset
 * @property {Number} limit
 * @property {Number} pages
 * @property {Number} currentPage
 * @property {Number} itemsOnPage
 * @property {Number} nextPage
 * @property {Number} prevPage
 */

/**
 * @template T
 * @typedef ApiResponse
 * @property {Boolean} success
 * @property {String} msg
 * @property {Number} code
 * @property {T} [data]
 * @property {ApiPagination} [pagination]
 *
 */

/**
 * @typedef OpCredits
 * @property {String} title
 * @property {String} author
 * @property {URL} [url]
 * @property {String} [licence]
 * @property {String} [version]
 * @property {Number} [date]
 */
/**
 * @typedef OpVersion
 * @property {String} name
 */

/**
 * @typedef OpDoc
 * @property {String} [id]
 * @property {String} [name]
 * @property {String} [content]
 * @property {String} [namespace]
 * @property {String} [nameNoVersion]
 * @property {String} [shortName]
 * @property {String} [shortNameDisplay]
 * @property {String} [authorName]
 * @property {String} [exampleProjectId]
 * @property {String[]} [libs]
 * @property {String[]} [coreLibs]
 * @property {String[]} [attachmentFiles]
 * @property {String[]} [youtubeids]
 * @property {String[]} [youtubeids]
 * @property {OpVersion[]} [versions]
 * @property {String} [summary]
 * @property {Number} [version]
 * @property {Number} [created]
 * @property {Object} [layout]
 * @property {Boolean} [userOp]
 * @property {Boolean} [isReleased]
 * @property {Boolean} [hasExample]
 * @property {Boolean} [oldVersion]
 * @property {Boolean} [allowEdit]
 * @property {Boolean} [isExtended]
 * @property {String} [hasPublicRepo=false]
 * @property {boolean} [hidden=false]
 * @property {OpCredits[]} [credits]
 * @property {Object[]} [changelog]
 * @property {Object[]} [todos]
 * @property {Object[]} [dependencies]
 * @property {Object[]} [issues]
 * @property {String} [caniusequery]
 * @property {String} [cloneOf]
 * @property {string} description
 * @property {string} teamName
 * @property {string} teamLink
 * @property {string} numOps
 * @property {array} ops
 */

/**
 * @typedef SerializedLink
 * @property {string} portIn
 * @property {string} portOut
 * @property {string} objIn
 * @property {string} objOut
 */

/**
 * @typedef SerializedPort
 * @property {string} name
 * @property {string} title
 * @property {number} order
 * @property {string} [useVariable]
 * @property {import("cables/src/core/anim.js").SerializedAnim} [anim]
 * @property {boolean} [animated]
 * @property {boolean} [expose]
 * @property {any} [value]
 * @property {SerializedLink[]} [links]
 */

/**
 * @typedef SerializedOp
 * @property {string} opId
 * @property {string} objName
 * @property {string} id
 * @property {Object} storage
 * @property {Object} attribs
 * @property {import("cables/src/core/core_op.js").OpUiAttribs} uiAttribs
 * @property {SerializedPort[]} portsIn
 * @property {SerializedPort[]} portsOut
 */

/**
 * @typedef SerializedPatchUi
 * @property {Object} [viewBoxesGl]
 * @property {Object} [outline]
 */

/**
 * @typedef PatchSummary
 * @property {string} [title]
 * @property {string[]} [exampleForOps]
 */

/**
 * @typedef SerializedPatch
 * @property {string} _id
 * @property {string} name
 * @property {string} shortId
 * @property {PatchSummary} summary
 * @property {SerializedOp[]} ops
 * @property {SerializedPatchUi} ui
 */

/**
 * @typedef ErrorReport
 * @property {string} title
 * @property {string} patchTitle
 * @property {string[]} log
 * @property {string} url
 * @property {string} cablesUrl
 * @property {string} projectId
 * @property {string} infoLanguage
 * @property {number} time
 * @property {string} username
 * @property {string} userId
 * @property {string} glRenderer
 * @property {string} platformVersion
 * @property {string} browserDescription
 * @property {Object} browserInfo
 * @property {string[]} history
 */
