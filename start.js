const concurrently = require('concurrently');

concurrently([
    {
        command:'cd cables_api;npm run start',
        name:"api",
        prefixColor:"cyan"
    },
    {
        command:'cd cables;npm run watch',
        name:"core",
        prefixColor:"red"
    },
    {
        command:'cd cables_ui;gulp',
        name:"_ui",
        prefixColor:"green"
    }
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3,
}).then((success)=>{console.log("success!",success);}).catch(err => console.log('error',err));




