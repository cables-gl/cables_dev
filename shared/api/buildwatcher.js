import socketClusterClient from "socketcluster-client";
import jwt from "jsonwebtoken";
import SharedLogger from "./utils/shared_logger.js";
import { utilProvider } from "./index.js";
import { UtilProvider } from "./utils/util_provider.js";

export default class BuildWatcher
{

    constructor(gulp, cablesConfig, module)
    {
        this._gulp = gulp;
        this._module = module;
        this._config = cablesConfig.socketclusterClient || {};
        const serverConfig = cablesConfig.socketclusterServer || {};
        this._socketCluster = {
            "active": this._config.enabled,
            "config": this._config,
            "connected": false,
            "socket": null,
            "secret": serverConfig.secret
        };

        const Logger = class extends SharedLogger
        {
            get utilName()
            {
                return UtilProvider.BUILD_WATCHER;
            }

            _logConsole(initiator, level, context, args, dateFormat = "HH:mm:ss", shortFormat = false)
            {
                super._logConsole(initiator, level, context, args, dateFormat, true);
            }
        };
        this._log = new Logger(utilProvider);
    }

    watch(glob, watchOptions, task)
    {
        if (this._socketCluster.active)
        {
            const _build_watcher = (done) =>
            {
                this._sendBroadcast({ "build": "started", "time": Date.now(), "module": this._module });
                task(() =>
                {
                    this._sendBroadcast({ "build": "ended", "time": Date.now(), "module": this._module });
                    done();
                });
            };
            this._gulp.watch(glob, watchOptions, _build_watcher);
        }
        else
        {
            this._gulp.watch(glob, watchOptions, task);
        }

    }

    _connect()
    {
        if (this._socketCluster.active && !this._socketCluster.connected)
        {
            this._socketCluster.socket = socketClusterClient.create({
                "hostname": this._config.hostname,
                "port": this._config.port,
                "secure": this._config.secure
            });
            this._log.info(this._module + " - connected to socketcluster server at " + this._socketCluster.config.hostname);
            this._socketCluster.connected = true;
        }
    }

    _sendBroadcast(data)
    {
        if (!this._socketCluster.active) return;
        if (!this._socketCluster.connected) this._connect();
        const channelName = "broadcast";
        if (!this._socketCluster.connected)
        {
            this._log.info("not broadcasting serverside message - not connected");
            return;
        }
        const socketclusterToken = jwt.sign(
            {
                "channels": [channelName],
            },
            this._socketCluster.secret,
        );

        const payload = {
            "token": socketclusterToken,
            "topic": "notify",
            "data": data
        };
        this._socketCluster.socket.transmitPublish(channelName, payload);
    }

}
