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

var fpReadings = new CronJob('*/55 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            var dates = EDS.dateFilterSetup(Constants.Meters.filters.monthAVG);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                +dates.end + "?var=" +meter.summatory_device+ "." +Constants.Meters.common_names.summatory_pf + "?period=" + dates.period;

            // console.log('service to call:', serviceToCall);
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    let summatory = 0;
                    if(reading.recordGroup.record){
                        Object.keys(reading.recordGroup.record.field).forEach(function(key) {
                            summatory += parseInt(reading.recordGroup.record.field[key].value._text);
                        });

                        summatory = summatory.toFixed(2);
                        // console.log('FP: '+ meter.device_name + ': value => ' + summatory);
                        meter.latestValues.lastUpdated = new Date();
                        if(!meter.latestValues.fp){
                            meter.latestValues.fp = {};
                            meter.latestValues.fp.value = summatory;
                        } else {
                            meter.latestValues.fp.value = summatory;
                        }

                        let company_id = meter.company().id;
                        meter.unsetAttribute("company");
                        meter.unsetAttribute("meter");
                        meter.save(function(err, dsgMeter){
                            if(err) next(err, null);
                            else {
                                let socketData = {
                                    socketEvent: 'odometerReading',
                                    data: meter.latestValues.dp
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
