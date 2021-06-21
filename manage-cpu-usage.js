const pm2 = require('pm2');
CHECK_CPU_USAGE_INTERVAL    = 1000*60; // every minute
HIGH_CPU_USAGE_LIMIT        = 70; // percentage

pm2.connect(function(err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.start({
        script    : 'server.js',         // Script to be run
        exec_mode : 'cluster',        // Allows your app to be clustered
        instances : 1,                // Optional: Scales your app by 4
        max_memory_restart : '100M'   // Optional: Restarts your app if it reaches 100Mo
    }, function(err, apps) {
        pm2.disconnect();   // Disconnects from PM2
        if (err) throw err
    });

    setInterval(function()
    {
        console.log(process.pid)
        pm2.list((err, list) => {
            // console.log(err, list)
        })
        getProcessDescription();

    }, CHECK_CPU_USAGE_INTERVAL);
});

function getProcessDescription() {
    pm2.describe('server', (err, proc) => {
        console.log('============================processDescription=============================')
        console.log(proc[0].monit)
        proc.forEach((process)=>{
            if(process.monit && process.monit.cpu > HIGH_CPU_USAGE_LIMIT){
                pm2.restart(process.name, (errOnRestart)=>{
                    if(errOnRestart){
                        console.log(errOnRestart)
                    }
                })
            }
        })
        console.log('===========================================================================')
        if(err){
            console.log('============================Error - processDescription=============================')
            console.log(err)
            console.log('===================================================================================')
        }
    })
}