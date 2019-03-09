const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
const async = require('async');
const ping = require ("net-ping");
const dns = require('dns');

const timezone = 'America/Mexico_City';

const meterAvailability = new CronJob('* * * * *', function () {
    DesignatedMeter.find({}, (err, meters) => {
        async.each(meters, (meter, next) => {
            const target = meter.hostname.replace('http://', '');
            const session = ping.createSession();

            dns.lookup(target, function (err, address) {
              if (err) next();
              else {
                session.pingHost(address, function (error, target) {
                    if (error && meter.isAvailable) {
                        console.log (target + ": " + error.toString ());
                        meter.updateAttribute(
                            'isAvailable',
                            false, () => {
                                next();
                            });
                    }
                    else if (!error && !meter.isAvailable){
                        meter.updateAttribute(
                            'isAvailable',
                            true, () => {
                                next();
                            });
                    } else {
                        next();
                    }
                });
              }
            });
        });
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);