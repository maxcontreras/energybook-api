const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

const timezone = 'America/Mexico_City';

var fpReadings = new CronJob('5,35 * * * *', function () {
    console.log('Starting fp readings job')
    DesignatedMeter.fpReadings(undefined, (err, res) => {
        console.log('Finished fp readings job')
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
