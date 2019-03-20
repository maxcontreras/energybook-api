const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

var timezone = 'America/Mexico_City';

var consumptionSummary = new CronJob('3,8,12,17,22,27,33,38,42,48,50,53 * * * *', function () {
    // console.log('Starting consumption summary job')
    DesignatedMeter.consumptionSummary(undefined, (err, res) => {
        // console.log('Finished consumption summary job')
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
