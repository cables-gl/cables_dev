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
 * @typedef activityFeed
 * @property {number} count
 */

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
 * @typedef {any} RawApiResponse
 *
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
 * @typedef OpCredit
 * @property {String} title
 * @property {String} author
 * @property {String} [username]
 * @property {String} [url]
 * @property {String} [licence]
 * @property {String} [version]
 * @property {Number} [date]
 */

/**
 * @typedef OpVersion
 * @property {String} name
 */

/**
 * @typedef OpDependency
 * @property {string} src
 * @property {"commonjs"|"module"|"npm"|"op"|"corelib"} type
 * @property {String} [export]
 * @property {String} [readable]
 * @property {String} opName
 */

/**
 *
 * @typedef UserSettings
 *
 * @property {1|2|4} [patch_button_scroll]
 * @property {1|2|4} [patch_button_select]
 * @property {"zoom"|"pan"|"auto"} [patch_wheelmode]
 * @property {number} [wheelmultiplier]
 * @property {number} [patch_panspeed]
 * @property {boolean} [patch_allowCableDrag]
 * @property {boolean} [autoLinkOps]
 * @property {boolean} [snapToGrid2]
 * @property {boolean} [snapToGrid]
 * @property {boolean} [checkOpCollisions]
 * @property {boolean} [quickLinkLongPress]
 * @property {boolean} [quickLinkMiddleMouse]
 * @property {boolean} [glpatch_cursor]
 * @property {boolean} [miniopselect]
 * @property {boolean} [minifiedOpHead]
 * @property {boolean} [showMinimap]
 * @property {boolean} [touchpadmode]
 * @property {boolean} [helperMode]
 * @property {boolean} [vizlayerpaused]
 * @property {boolean} [overlaysShow]
 * @property {boolean} [glpatch_showboundings]
 * @property {boolean} [gluidebugcolors]
 * @property {"curved"|"simple"|"straight"} [linetype]
 * @property {1|2|3|4} [glcablewidth]
 * @property {boolean} [straightLines]
 * @property {boolean} [noFadeOutCables]
 * @property {boolean} [fadeOutOptions]
 * @property {0|1|2|3|boolean} [glflowmode]
 * @property {"bgPatternDark"|"bgPatternBlack"|"bgPatternGrey"|"bgPatternBright"|"bgPatternWhite"|"bgPatternBlue"|"bgPatternRed"} [bgpattern]
 * @property {-2|-1|1|2|3|4|false} [fontSizeOff]
 * @property {boolean} [hideSizeBar]
 * @property {boolean} [presentationmode]
 * @property {0|1|2|3|4|false} [canvasmode]
 * @property {boolean} [hideCanvasUi]
 * @property {boolean} [bgpreview]
 * @property {boolean} [bgpreviewMax]
 * @property {"corner"|false} [texpreviewMode]
 * @property {boolean} [texpreviewTransparent]
 * @property {number} [texpreviewSize]
 * @property {boolean} [forceWebGl1]
 * @property {boolean} [idlemode]
 * @property {number} [editorWidth]
 * @property {number} [rightpanelWidth]
 * @property {number} [bottomPanelHeight]
 * @property {boolean} [maintabsVisible]
 * @property {boolean} [bottomTabsVisible]
 * @property {boolean} [closeInfoArea2]
 * @property {Object<string, boolean>} [sidebar_left]
 * @property {Array<{name: string, type: string, data: object}>} [openEditors]
 * @property {string} [editortab]
 * @property {string} [tabsLastTitle_maintabs]
 * @property {string} [tabsLastTitle_bottomtabs]
 * @property {string} [tabsLastTitle_metatabpanel]
 * @property {boolean} [escape_closetabs]
 * @property {"name"|"size"|"date"|"type"} [filemanager_order]
 * @property {"icons"|"list"} [filemanager_display]
 * @property {boolean} [glTimelineOpened]
 * @property {boolean} [tl_opened]
 * @property {0|1|false} [tl_layout]
 * @property {0|1|2|false} [tl_units]
 * @property {number} [tl_split_left]
 * @property {number} [tl_split_right]
 * @property {boolean} [tl_graphSelectMode]
 * @property {boolean} [tl_keyframeAutoCreate]
 * @property {"cmhx"|"textarea"|false} [texteditor]
 * @property {number} [fontsize_ace]
 * @property {boolean} [wrapmode_ace]
 * @property {string} [ace_keymode]
 * @property {boolean} [formatcode]
 * @property {string} [loggingFilter]
 * @property {boolean} [openLogTab]
 * @property {boolean} [showAllShaderErrors]
 * @property {boolean} [sendErrorReports]
 * @property {boolean} [devinfos]
 * @property {boolean} [showUIPerf]
 * @property {string} [showUIPerfFilter]
 * @property {string} [uiPerfLastHighlight]
 * @property {boolean} [notlocalizeNumberformat]
 * @property {boolean} [introCompleted]
 * @property {boolean} [showTipps]
 * @property {boolean} [nobrowserWarning]
 * @property {number} [changelogLastView]
 * @property {boolean} [randomizePatchName]
 * @property {string} [authorName]
 * @property {boolean} [editorAudioMute]
 * @property {string} [keybind_escape]
 * @property {Array<{id: string, cmd: string}>} [inputbinds]
 * @property {String} opLicense
 *
 * cables_electron
 * @property {boolean} [openlastproject]
 * @property {boolean} [openfullscreen]
 * @property {boolean} [maximizerenderer]
 * @property {boolean} [transparentpopout]
 * @property {string} [downloadPath]
 * @property {boolean} [storeWindowBounds]
 */

/**
 * @typedef OpDoc
 * @property {import("cables/src/core/core_op.js").OpId} [id]
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
 * @property {OpCredit[]} [credits]
 * @property {Object[]} [changelog]
 * @property {Object[]} [todos]
 * @property {OpDependency[]} [dependencies]
 * @property {Object[]} [issues]
 * @property {String} [caniusequery]
 * @property {String} [cloneOf]
 * @property {string} description
 * @property {string} teamName
 * @property {string} teamLink
 * @property {string} numOps
 * @property {array} ops
 * @property {OpDoc} [newestVersion]
 * @property {String} [opDirFull]
 */

/**
 * @typedef SerializedLink
 * @property {string} portIn
 * @property {string} portOut
 * @property {import("cables/src/core/core_op.js").OpInstanceId} objIn
 * @property {import("cables/src/core/core_op.js").OpInstanceId} objOut
 */

/**
 * @typedef OpDir
 * @property {String} dir
 * @property {Boolean} removable
 * @property {Number} numUsedOps
 * @property {Boolean} [selected]
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
 * @property {import("cables/src/core/core_op.js").OpId} opId
 * @property {import("cables/src/core/core_op.js").OpName} objName
 * @property {import("cables/src/core/core_op.js").OpInstanceId} id
 * @property {Object} storage
 * @property {Object} attribs
 * @property {import("cables/src/core/core_op.js").OpUiAttribs} uiAttribs
 * @property {SerializedPort[]} portsIn
 * @property {SerializedPort[]} portsOut
 */

/**
 * @typedef SerializedPatchUi
 * @property {Object} [viewBoxesGl]
 * @property {string} [currentSubPatch]
 * @property {Object} [outline]
 */

/**
 * @typedef PatchSummary
 * @property {string} [title]
 * @property {boolean} [isTest]
 * @property {boolean} [isPublic]
 * @property {string[]} [exampleForOps]
 */

/**
 * @typedef BuildInfoBuild
 * @property {BuildInfoGit} [git]
 * @property {number} [created]
 * @property {number} [version]
 * @property {BuildInfoPlatform} [platform]
 */
/**
 * @typedef BuildInfoGit
 * @property {string} [branch]
 * @property {string} [tag]
 * @property {string} [message]
 */
/**
 * @typedef BuildInfoPlatform
 * @property {string} [node]
 * @property {string} [npm]
 */
/**
 * @typedef BuildInfo
 * @property {string} [host]
 * @property {BuildInfoBuild} [ui]
 * @property {BuildInfoBuild} [core]
 * @property {BuildInfoBuild} [api]
 */

/**
 * @typedef SerializedPatch
 * @property {string} _id
 * @property {string} name
 * @property {string} shortId
 * @property {boolean} isOpExample
 * @property {PatchSummary} summary
 * @property {SerializedOp[]} ops
 * @property {SerializedPatchUi} ui
 * @property {BuildInfo} buildInfo
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
 * @property {BuildInfo} buildInfo
 * @property {string[]} history
 */

/**
 * @typedef CablesJSONPaths
 * @property {string} ops
 * @property {string} libs
 * @property {string} corelibs
 * @property {string} assets
 * @property {string} [libraryassets]
 * @property {string} [userops]
 * @property {string} [teamops]
 * @property {string} [extensionops]
 * @property {string} [patchops]
 * @property {string} [docs_md]
 * @property {string} [electron]
 * @property {string} [changelog]
 * @property {string} [ui]
 * @property {string} [uiDist]
 * @property {string} [standaloneDist]
 * @property {string} [js]
 */

/**
 * @typedef CablesJSONSourcePaths
 * @property {string} ops
 * @property {string} libs
 * @property {string} corelibs
 * @property {string} uiDist
 */

/**
 * @typedef CablesJSONSocketCluster
 * @property {Object} [server]
 * @property {string} [server.interface]
 * @property {number} [server.port]
 * @property {number} [server.logLevel]
 * @property {Object} [server.options]
 * @property {string} [server.secret]
 * @property {Object} [client]
 * @property {boolean} [client.enabled]
 * @property {string} [client.hostname]
 * @property {number} [client.port]
 * @property {boolean} [client.secure]
 */

/**
 * @typedef CablesJSONObjectStorageBucket
 * @property {boolean} enabled
 * @property {string} name
 * @property {string} accessKey
 * @property {string} secret
 * @property {string} region
 * @property {string} endpoint
 * @property {string} [url]
 */

/**
 * @typedef CablesJSONObjectStorage
 * @property {boolean} enabled
 * @property {string} [bucket]
 * @property {string} [accessKey]
 * @property {string} [secret]
 * @property {string} [region]
 * @property {string} [endpoint]
 * @property {{enabled: boolean, buckets: CablesJSONObjectStorageBucket[]}} [archive]
 * @property {{enabled: boolean, buckets: CablesJSONObjectStorageBucket[]}} [backups]
 * @property {{enabled: boolean, buckets: CablesJSONObjectStorageBucket[]}} [assets]
 * @property {{enabled: boolean, buckets: CablesJSONObjectStorageBucket[]}} [dummyclient]
 */

/**
 * @typedef CablesJSONExternalOps
 * @property {string} repo
 * @property {string} ref
 */

/**
 * @typedef CablesJSON
 * @property {string} env
 * @property {string} url
 * @property {CablesJSONPaths} path
 * @property {{level: "debug"|"verbose"|"info"|"warn"|"error"|"uncaught"}} logger
 * @property {boolean} [minifyJs]
 * @property {boolean|string} [sourceMap]
 * @property {string} [communityUrl]
 * @property {CablesJSONSourcePaths} [sourcePath]
 * @property {CablesJSONExternalOps[]} [externalOps]
 * @property {boolean} [isPackaged]
 * @property {boolean} [forceSendErrorReports]
 * @property {string} [uiIndexHtml]
 * @property {string} [interfaceIp]
 * @property {number} [port]
 * @property {{interfaceIp: string, port: number, url: string}} [sandbox]
 * @property {string} [mongo]
 * @property {string} [sessionSecret]
 * @property {number} [maxFileSizeMb]
 * @property {boolean} [watchOps]
 * @property {boolean} [watchBuildWhenLocal]
 * @property {boolean} [localOpPermissions]
 * @property {boolean} [rateLimiting]
 * @property {number} [rateLimitWindow]
 * @property {number} [rateLimit]
 * @property {boolean} [enableCaptcha]
 * @property {boolean} [random404Patch]
 * @property {string[]} [crossDomainOrigins]
 * @property {string[]} [landingDemos]
 * @property {string[]} [ignoreFiles]
 * @property {string} [webhooksSecret]
 * @property {{name: string, cmd: string, secret: string}[]} [webhooks]
 * @property {CablesJSONSocketCluster} [socketcluster]
 * @property {{updateWarning: boolean, path: {core: string, api: string, ui: string, shared: string}}} [buildInfo]
 * @property {CablesJSONObjectStorage} [objectStorage]
 * @property {{backend: string, auth: Object}} [caching]
 * @property {Object<string, string>} [discord]
 * @property {{nodejs: {enabled: boolean}, delay: {enabled: boolean, min: number, max: number}}} [debug]
 * @property {{is_testenvironment: boolean, user: Object|null, admin: Object|null, hostUrl?: string, apiKey?: string}} [tests]
 * @property {{active: boolean, host: string, apiKey: {id: string, key: string}}} [elastic]
 * @property {{elastic: {active: boolean, eventsIndex: string}}} [analytics]
 * @property {{requests: {slow: number}, assetSpace: {enabled: boolean, path: string, thresholdGb: number}}} [monitor]
 * @property {{adminActive: boolean, creatorAccessToken: string, clientId: string, clientSecret: string}} [patreon]
 * @property {{token: {mail: string, public: string, private: string}}} [webPush]
 * @property {{discussions: {apikey: string}}} [github]
 * @property {{enabled: boolean, debugMode: boolean, endpoint: string, user: string, token: string, templates: Object<string, number>}} [listmonk]
 * @property {number} [temporaryPatchRetentionDays]
 * @property {number} [validateOpCodeSizeThresholdBytes]
 */
