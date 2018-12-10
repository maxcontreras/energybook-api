const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');
const async = require('async');
const app = require('./../server');
const Meters = app.loopback.getModel('Meter');
const Constants = require('./../../server/constants.json');
const EDS = require('../../server/modules/eds-connector');
const WS = require('../boot/websockets');
var Socket = new WS;
const Converter = require('xml-js');

const API_PREFIX = "/services/user/";
const DEFAULT_HOURS = 24;
const DEFAULT_DAYS = 1;
const CHARGE_FACTOR = Constants.CFE.values.charge_factor;

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();

const OPTIONS_XML2JS  = {
    compact: true,
    spaces: 4
}
const OPTIONS_JS2XML = {
    indentAttributes: true,
    spaces: 2,
    compact: true,
    fullTagEmptyElement:false
};

moment.tz.setDefault("America/Mexico_City");
var timezone = 'America/Mexico_City';

var consumptionSummary = new CronJob('*/5 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            let dates = EDS.dateFilterSetup(Constants.Meters.filters.month);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml"+"?begin="+dates.begin+"?end="+dates.end;
            Object.keys(meter.devices).forEach(function(key) {
                serviceToCall += "?var="+ meter.devices[key] + ".EPimp";
            });
            serviceToCall += "?period="+dates.period;
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    if(!meter.latestValues.consumption){
                        meter.latestValues.consumption = {};
                        meter.latestValues.consumption.summatory = {};
                    } else {
                        meter.latestValues.consumption.summatory = {};
                    }
                    if(reading.recordGroup && reading.recordGroup.record){
                        let read = {};
                        reading.recordGroup.record.map((item) => {
                            let key = 0;
                            for (let device of item.field) {
                                const name = device.id._text.split(".")[0];
                                const value = parseInt(device.value._text);
                                if (!read[key]) {
                                    read[key] = {};
                                    read[key].value = 0;
                                }
                                read[key].device = name;
                                read[key].value += value;
                                key++;
                            }
                        });
                        Object.keys(read).forEach(key => {
                            meter.latestValues.consumption.summatory[key] = read[key];
                        });

                        let company_id = meter.company().id;
                        meter.unsetAttribute("company");
                        meter.unsetAttribute("meter");
                        meter.save(function(err, dsgMeter){
                            if(err) next(err);
                            let socketData = {
                                socketEvent: 'consumptionSummary',
                                data: meter.latestValues.consumption
                            };
                            socketData = JSON.stringify(socketData);
                            Socket.sendMessageToCompanyUsers(company_id, socketData);
                            next();
                        });
                    }
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    var reading = {};
                    next();
                }
            };
            xhr.send();
        });
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);
