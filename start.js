import concurrently from "concurrently";
import kill from "tree-kill";

const args = process.argv ? process.argv.slice(2) : [];
const standalone = args && args[0] === "standalone";

let commands = [
    {
        "command": "cd shared && npm ci",
        "name": "core",
        "prefixColor": "yellow",
    },
    {
        "command": "cd cables && npm run start",
        "name": "core",
        "prefixColor": "yellow",
    },
    {
        "command": "cd cables_ui && npm run start",
        "name": "gui ",
        "prefixColor": "green",
    },
];

if (!standalone)
{
    commands.splice(2, 0, {
        "command": "cd cables_api && npm run start",
        "name": "api ",
        "prefixColor": "cyan",
    });
}

const { result } = concurrently(
    commands,
    {
        "prefix": "name",
        "killOthers": ["failure", "success"],
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
