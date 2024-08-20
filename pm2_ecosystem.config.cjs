module.exports = {
    "apps": [{
        "name": "server_api",
        "script": "src/servers/server_api.js",
        "cwd": "./cables_api",
        "instances": 4
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
    }],
};
