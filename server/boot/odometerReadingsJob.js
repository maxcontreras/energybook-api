const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

const timezone = 'America/Mexico_City';

var odometerReadings = new CronJob('2,7,10,14,16,19,21,24,26,29,32,37,40,44,47,52,56,58 * * * *', function () {
    console.log('Starting odometer readings job')
    DesignatedMeter.odometerReadings(undefined, (err, res) => {
        console.log('Finished odometer readings job')
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
