const concurrently = require("concurrently");
const kill = require("tree-kill");

concurrently(
    [
        {
            command: "cd cables_api;npm run start",
            name: "api",
            prefixColor: "cyan",
        },
        {
            command: "cd cables_ui;gulp",
            name: "_ui",
            prefixColor: "green",
        },
    ],
    {
        prefix: "name",
        killOthers: ["failure", "success"],
        restartTries: 3,
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
