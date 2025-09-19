module.exports = {
    "apps": [
        {
            "name": "server_api",
            "script": "src/servers/server_api.js",
            "cwd": "./cables_api",
            "interpreter_args": "--inspect=127.0.0.1:9230",
            "exec_mode": "cluster"
        },
        {
            "name": "server_api",
            "script": "src/servers/server_api.js",
            "cwd": "./cables_api",
            "interpreter_args": "--inspect=127.0.0.1:9231",
            "exec_mode": "cluster"
        },
        {
            "name": "server_api",
            "script": "src/servers/server_api.js",
            "cwd": "./cables_api",
            "interpreter_args": "--inspect=127.0.0.1:9232",
            "exec_mode": "cluster"
        },
        {
            "name": "server_api",
            "script": "src/servers/server_api.js",
            "cwd": "./cables_api",
            "interpreter_args": "--inspect=127.0.0.1:9233",
            "exec_mode": "cluster"
        },
        {
            "name": "server_sandbox",
            "script": "src/servers/server_sandbox.js",
            "cwd": "./cables_api",
            "instances": 4
        },
        {
            "name": "server_socketcluster",
            "script": "src/servers/server_socketcluster.js",
            "cwd": "./cables_api",
            "instances": 1,
            "args": "-w 2 -s 2"
        }]
};
