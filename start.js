const concurrently = require("concurrently");
const kill = require("tree-kill");

const shouldStartServers = Boolean(Number(process.env.STARTSERVERS));
const shouldStartServices = Boolean(Number(process.env.STARTSERVICES));

console.log("shouldStartServers", shouldStartServers);
console.log("shouldStartServices", shouldStartServices);


concurrently(
    [
        shouldStartServices && {
            "command": "cd cables_api && mongod",
            "name": "mongod",
            "prefixColor": "gray",
        },
        shouldStartServices && {
            "command": "cd cables_api && memcached",
            "name": "memcached",
            "prefixColor": "gray",
        },
        shouldStartServers && {
            "command": "cd cables_api && npm run start",
            "name": "api ",
            "prefixColor": "cyan",
        },
        !shouldStartServers && {
            "command": "cd cables_api && npm run start:watch",
            "name": "api ",
            "prefixColor": "cyan",
        },
        {
            "command": "cd cables_ui && gulp",
            "name": "gui ",
            "prefixColor": "green",
        },
        {
            "command": "cd cables && npm run watch",
            "name": "core",
            "prefixColor": "yellow",
        },
    ].filter(Boolean),
    {
        "prefix": "name",
        "killOthers": ["failure", "success"],
        "restartTries": 3,
    },
)
    .then((success) =>
    {
        console.log("success!", success);
    })
    .catch(err => console.log("error", err));

const pid = process.pid;

process.on("SIGINT", () =>
{
    kill(pid, "SIGKILL");
    console.log("KILLED ALL!");
});
