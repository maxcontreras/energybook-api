const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

const timezone = 'America/Mexico_City';

var odometerReadings = new CronJob('*/3 * * * *', function () {
    DesignatedMeter.odometerReadings((err, res) => {
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
