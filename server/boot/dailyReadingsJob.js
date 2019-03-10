const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

var timezone = 'America/Mexico_City';

var dailyReadings = new CronJob('57 * * * *', function () {
    // console.log('Starting daily readings job')
    DesignatedMeter.dailyReadings(undefined, (err, res) => {
        // console.log('Finished daily readings job')
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);

function Distribution(){
    var self = this;

    self.init = function(){

    }

    self.init();
}

module.exports = Distribution;
