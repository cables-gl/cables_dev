const concurrently = require("concurrently");
const kill = require("tree-kill");

concurrently(
    [
        {
            "command": "cd cables && npm run start",
            "name": "core",
            "prefixColor": "yellow",
        },
        {
            "command": "cd cables_api && npm run start",
            "name": "api ",
            "prefixColor": "cyan",
        },
        {
            "command": "cd cables_ui && npm run start",
            "name": "gui ",
            "prefixColor": "green",
        },
    ].filter(Boolean),
    {
        "prefix": "name",
        "killOthers": ["failure", "success"],
        "restartTries": 3,
    },
).then(() =>
{
    console.log("stopped!");
}, () => { console.log("WTF!!!!!!"); }).catch(err => console.log("error", err));

process.on("SIGINT", () =>
{
    kill(process.pid, "SIGHUP");
});
