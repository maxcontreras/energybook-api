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

var epimpHistory = new CronJob('*/60 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            let dates = EDS.dateFilterSetup(Constants.Meters.filters.month);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="+dates.end;
            meter.devices.map(device => {
                serviceToCall += "?var="+device+".EPimp";
            });
            serviceToCall += "?period=" +dates.period;
            // console.log('serviceToCall:', serviceToCall);
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    if (reading.recordGroup && reading.recordGroup.record) {
                        meter.latestValues.epimp = {};
                        reading.recordGroup.record.map( (item, key) => {
                            let read = {};
                            if(item.field){
                                read.value = 0;
                                item.field.map(device => {
                                    read.value += parseFloat(device.value._text);
                                });
                                read.value = read.value.toFixed(2);
                            } else {
                                read.value = "0";
                            }
                            read.date = item.dateTime._text;
                            meter.latestValues.epimp[key] = read;
                        });
    
                        let company_id = meter.company().id;
                        meter.unsetAttribute("company");
                        meter.unsetAttribute("meter");
                        meter.save(function(err, dsgMeter){
                            let socketData = {
                                socketEvent: 'epimpHistoryReading',
                                data: meter.latestValues.epimp
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
        }, function(_err) {
            if(_err) console.log('error reading', _err);
        });
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);

function EPimpHistory(){
    var self = this;

    self.init = function(){
        this.epimpHistory = epimpHistory;
    }

    self.getEPimpHistory = function getEPimpHistory(meter){
        EDS.readDemand(meter, function(err, epimpHistory){
            if(epimpHistory){
                let socketData = {
                    socketEvent: 'epimpHistoryReading',
                    data: epimpHistory
                };
                socketData = JSON.stringify(socketData);
                Socket.sendMessageToCompanyUsers(meter.company().id, socketData);
                return;
            }
        });
    }

    self.init();
}

module.exports = EPimpHistory;
