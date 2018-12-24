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

const fpFormula = function(P, Q) {
    return P/Math.sqrt(Math.pow(P, 2) + Math.pow(Q, 2));
}

var fpReadings = new CronJob('*/30 * * * *', function () {
    Meters.getActivesAssigned(function(err, meters) {
        async.each(meters, function(meter, next){
            var dates = EDS.dateFilterSetup(Constants.Meters.filters.monthAVG);
            let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end=" +dates.end 
            meter.devices.map(device => {
                serviceToCall += "?var="+device+".EPimp"+"?var="+device+".EQimp";
            });
            serviceToCall += "?period=" + dates.period;

            // console.log('service to call:', serviceToCall);
            xhr.open('GET', serviceToCall, false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    let P = 0;
                    let Q = 0;
                    if(reading.recordGroup.record){
                        reading.recordGroup.record.field.map(read => {
                            const type = read.id._text.split('.')[1];
                            let value = parseFloat(read.value._text);
                            if (type === 'EPimp') {
                                P += value;
                            } else {
                                Q += value;
                            }
                        });
                        const fp = (fpFormula(P, Q)*100).toFixed(2);
                        meter.latestValues.lastUpdated = new Date();
                        if(!meter.latestValues.fp){
                            meter.latestValues.fp = {};
                        }
                        meter.latestValues.fp.value = fp;
                        if (!meter.latestValues.reactive){
                            meter.latestValues.reactive = {}
                        }
                        meter.latestValues.reactive.value = Q.toFixed(2);

                        let company_id = meter.company().id;
                        meter.unsetAttribute("company");
                        meter.unsetAttribute("meter");
                        meter.save(function(err, dsgMeter){
                            if(err) next(err, null);
                            else {
                                let socketData = {
                                    socketEvent: 'powerFactor',
                                    data: meter.latestValues.fp
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                socketData = {
                                    socketEvent: 'reactive',
                                    data: meter.latestValues.reactive
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
