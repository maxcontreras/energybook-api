const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

var timezone = 'America/Mexico_City';

var consumptionSummary = new CronJob('*/5 * * * *', function () {
    DesignatedMeter.consumptionSummary((err, res) => {
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
