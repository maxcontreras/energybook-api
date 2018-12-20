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


var monthlyReadings = new CronJob('0,15,30,45 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            var dates = EDS.dateFilterSetup(Constants.Meters.filters.monthAVG);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                +dates.end;
            Object.keys(meter.devices).forEach(function(key) {
                serviceToCall += "?var="+ meter.devices[key] + ".EPimp";
            });
            serviceToCall = serviceToCall + "?period=" + dates.period;
            // console.log('serviceToCall:', serviceToCall);
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    let summatory = 0;
                    if(reading.recordGroup.record){
                        Object.keys(reading.recordGroup.record.field).forEach(function(key) {
                            summatory += parseInt(reading.recordGroup.record.field[key].value._text);
                        });
                        const day = reading.recordGroup.record.dateTime._text.slice(0,2);
                        const month = reading.recordGroup.record.dateTime._text.slice(2,4);
                        const year = reading.recordGroup.record.dateTime._text.slice(4,8);
                        const hour = reading.recordGroup.record.dateTime._text.slice(8,10);
                        const minute = reading.recordGroup.record.dateTime._text.slice(10,12);
                        const second = reading.recordGroup.record.dateTime._text.slice(12,14);
                        const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                        let utc_date = moment(tmp_date).tz(timezone);
                        
                        let distribution = ( parseInt(summatory) / (DEFAULT_HOURS * dates.day * CHARGE_FACTOR) );
                        let consumption = parseInt(summatory);
                        distribution = distribution.toFixed(2);
                        consumption = consumption.toFixed(2);

                        meter.latestValues.lastUpdated = utc_date.format();
                        if(!meter.latestValues.distribution){
                            meter.latestValues.distribution = {};
                            meter.latestValues.distribution.monthly = distribution;
                        } else {
                            meter.latestValues.distribution.monthly = distribution;
                        }

                        if(!meter.latestValues.consumption){
                            meter.latestValues.consumption = {};
                            meter.latestValues.consumption.monthly = consumption;
                        } else {
                            meter.latestValues.consumption.monthly = consumption;
                        }
                        // console.log('monthly dist: '+ meter.device_name + ': value => ' + meter.latestValues.distribution);
                        let company_id = meter.company().id;
                        meter.unsetAttribute("company");
                        meter.unsetAttribute("meter");
                        meter.save(function(err, dsgMeter){
                            if(err) next(err, null);
                            else {
                                let socketData = {
                                    socketEvent: 'monthlyReading',
                                    data: meter.latestValues
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                next();
                            }
                        });
                    } else {
                        next();
                    }
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    var reading = {};
                    next();
                }
            };
            xhr.send();
        }, function(_err) {
            console.log('error reading', _err);
        });
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);

function Demand(){
    var self = this;

    self.init = function(){
        this.monthlyReadings =  monthlyReadings;
    }

    self.getDemand = function getDemand(meter){
        EDS.readDemand(meter, function(err, demand){
            if(demand){
                let socketData = {
                    socketEvent: 'demandReading',
                    data: demand
                };
                socketData = JSON.stringify(socketData);
                Socket.sendMessageToCompanyUsers(meter.company().id, socketData);
                return;
            }
        });
    }

    self.init();
}

module.exports = Demand;
