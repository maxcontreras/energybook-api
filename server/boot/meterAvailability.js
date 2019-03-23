const CronJob = require('cron').CronJob;
const app = require('./../server');
const async = require('async');
const API_PREFIX = "/services/user/";
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

const timezone = 'America/Mexico_City';

const hasChanged = (oldValue, newValue) => oldValue !== newValue;

new CronJob('* * * * *', function () {
    DesignatedMeter.find({}, (err, meters) => {
        if (err) return;
        async.each(meters, (meter, next) => {
            const xhr = new XMLHttpRequest();
            const service = meter.hostname+ API_PREFIX + "devices.xml";

            xhr.open('GET', service);

            setTimeout(() => {
                let isAvailable = false;
                if (xhr.readyState >= 3) {
                    isAvailable = true;
                }
                if (hasChanged(meter.isAvailable, isAvailable)) {
                    meter.updateAttribute('isAvailable', isAvailable);
                }
            }, 4000);

            xhr.send();
        }, function(err) {

        });
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
