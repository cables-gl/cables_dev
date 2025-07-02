import socketClusterClient from "socketcluster-client";
import sign from "jwt-encode";

export default class BuildWatcher
{

    constructor(gulp, cablesConfig, module)
    {
        this._gulp = gulp;
        this._module = module;
        this._config = cablesConfig.socketclusterClient || {};
        const serverConfig = cablesConfig.socketclusterServer || {};
        this._socketCluster = {
            "active": this._config.enabled && cablesConfig.watchBuildWhenLocal,
            "config": serverConfig,
            "connected": false,
            "socket": null,
            "secret": serverConfig.secret
        };

        this._log = {
            "info": (...args) =>
            {
                const date = new Date();
                let hours = ("0" + date.getHours()).slice(-2);
                let minutes = ("0" + date.getMinutes()).slice(-2);
                let seconds = ("0" + date.getMinutes()).slice(-2);
                console.log("[" + hours + ":" + minutes + ":" + seconds + "]", "[buildwatcher]", ...args);
            }
        };

    }

    watch(glob, watchOptions, task)
    {
        if (this._socketCluster.active)
        {
            if (!this._socketCluster.connected) this._connect();
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

    notify(glob, watchOptions, eventName)
    {
        if (this._socketCluster.active)
        {
            if (!this._socketCluster.connected) this._connect();
            const _build_notify = (fileName) =>
            {
                const data = { "build": eventName, "time": Date.now(), "module": this._module };
                let send = true;
                const dirSeperator = process && process.platform === "win32" ? "\\" : "/";
                switch (eventName)
                {
                case "opchange":
                    if (fileName)
                    {
                        data.opName = fileName.split(dirSeperator).reverse().find((pathPart) => { return pathPart && pathPart.startsWith("Ops.") && !pathPart.endsWith(".js"); });
                    }
                    break;
                case "attachmentchange":
                    if (fileName)
                    {
                        data.opName = fileName.split(dirSeperator).reverse().find((pathPart) => { return pathPart && pathPart.startsWith("Ops.") && !pathPart.endsWith(".js"); });
                        data.attachmentName = fileName.split(dirSeperator).reverse()[0];
                    }
                    break;
                }
                if (send) this._sendBroadcast(data);
            };
            const watcher = this._gulp.watch(glob, watchOptions);
            watcher.on("change", _build_notify);
        }
    }

    _connect()
    {
        if (this._socketCluster.active && !this._socketCluster.connected)
        {
            this._socketCluster.socket = socketClusterClient.create({
                "hostname": this._socketCluster.config.interface,
                "port": this._socketCluster.config.port,
                "secure": false
            });
            this._log.info(this._module, "- connected to socketcluster server at", this._socketCluster.config.interface + ":" + this._socketCluster.config.port);
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

        const socketclusterToken = sign({
            "channels": [channelName],
        }, this._socketCluster.secret);

        const payload = {
            "token": socketclusterToken,
            "topic": "notify",
            "data": data
        };
        this._socketCluster.socket.transmitPublish(channelName, payload);

    }

}
