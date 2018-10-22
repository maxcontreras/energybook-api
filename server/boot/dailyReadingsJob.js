const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');
const async = require('async');
const app = require('./../server');
const Meters = app.loopback.getModel('Meter');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
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

const http = require('http');

moment.tz.setDefault("America/Mexico_City");
var timezone = 'America/Mexico_City';

var dailyReadings = new CronJob('*/1 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            var dates = EDS.dateFilterSetup(Constants.Meters.filters.dayAVG);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                +dates.end+ "?var=" +meter.summatory_device+ "." +Constants.Meters.common_names.summatory_epimp+ "?period=" +dates.period;

            // console.log('service to call:', serviceToCall);
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    if(reading.recordGroup.record[1].field){
                        let distribution = ( parseInt(reading.recordGroup.record[1].field.value._text) / (dates.hour * DEFAULT_DAYS * CHARGE_FACTOR) );
                        let consumption = parseInt(reading.recordGroup.record[1].field.value._text);
                        let distributionCharge = distribution * Constants.CFE.values.distribution_price;
                        distribution = distribution.toFixed(2);
                        distributionCharge = distributionCharge.toFixed(2);
                        consumption = consumption.toFixed(2);

                        meter.latestValues.lastUpdated = new Date();
                        if(!meter.latestValues.distribution){
                            meter.latestValues.distribution = {};
                            meter.latestValues.distribution.daily = distribution;
                            meter.latestValues.distribution.charge = distributionCharge;
                        } else {
                            meter.latestValues.distribution.daily = distribution;
                            meter.latestValues.distribution.charge = distributionCharge;
                        }

                        if(!meter.latestValues.consumption){
                            meter.latestValues.consumption = {};
                            meter.latestValues.consumption.daily = consumption;
                        } else {
                            meter.latestValues.consumption.daily = consumption;
                        }
                    }
                    // console.log('daily consumption: '+ meter.device_name + ': value => ' + meter.latestValues.consumption);
                    let company_id = meter.company().id;
                    meter.unsetAttribute("company");
                    meter.unsetAttribute("meter");
                    meter.save(function(err, dsgMeter){
                        let socketData = {
                            socketEvent: 'dailyReading',
                            data: dsgMeter.latestValues
                        };
                        socketData = JSON.stringify(socketData);
                        Socket.sendMessageToCompanyUsers(company_id, socketData);
                        next();
                    });
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    console.log('error: ', xhr.status);
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

function Distribution(){
    var self = this;

    self.init = function(){

    }

    self.init();
}

module.exports = Distribution;
