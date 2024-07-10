import concurrently from "concurrently";
import kill from "tree-kill";
import fs from "fs";

const args = process.argv ? process.argv.slice(2) : [];
const standalone = args && args[0] === "standalone";

let commands = [
    {
        "command": "cd shared && npm run build",
        "name": "shared",
        "prefixColor": "blue"
    },
    {
        "command": "cd cables && npm run start",
        "name": "core",
        "prefixColor": "yellow",
    },
    {
        "command": "cd cables_ui && npm run start",
        "name": "gui",
        "prefixColor": "green",
    },
];

if (!standalone)
{
    let apiExists = true;
    try
    {
        if (!fs.statSync("cables_api").isDirectory() || !fs.existsSync("cables_api/src/cables.js"))
        {
            apiExists = false;
        }
    }
    catch (e)
    {
        apiExists = false;
    }
    if (apiExists)
    {
        commands.splice(2, 0, {
            "command": "cd cables_api && npm run start",
            "name": "api",
            "prefixColor": "cyan",
        });
    }
    else
    {
        console.warn("FATAL: running `npm run start`, but cables_api/ dir does not exist!");
        console.info("are you trying to run `npm run start:standalone`?");
        process.exit(1);
    }
}

const { result } = concurrently(
    commands,
    {
        "prefix": "name",
        "killOthers": ["failure"],
        "restartTries": 3,
    },
);

result.then(() =>
{
    console.log("stopped!");
    kill(process.pid, "SIGHUP");
}, () => { console.log("WTF!!!!!!"); }).catch((err) => { return console.log("error", err); });

process.on("SIGINT", () =>
{
    kill(process.pid, "SIGHUP");
});
