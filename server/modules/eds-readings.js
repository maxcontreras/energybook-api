'use strict';

const Converter = require('xml-js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const moment = require('moment-timezone');
const Constants = require('../constants.json');
const app = require('../server');
const Meters = app.loopback.getModel('Meter');

const EDS = require('./eds-connector');
const API_PREFIX = "/services/user/";

const DEFAULT_HOURS = 24;
const CHARGE_FACTOR = Constants.CFE.values.charge_factor;

const OPTIONS_XML2JS  = {
    compact: true,
    spaces: 4
}

const fpFormula = function(P, Q) {
    return P/Math.sqrt(Math.pow(P, 2) + Math.pow(Q, 2));
}

const fpReadings = function(meter, service, isSingleCompany, custom_dates, cb) {
    let xhr = new XMLHttpRequest();
    let dates;
    if (custom_dates.from && custom_dates.until) {
        dates = EDS.dateFilterSetup(Constants.Meters.filters.custom, custom_dates);
        const daysInMonth = moment(custom_dates.from).daysInMonth();
        dates.period = daysInMonth*86400;
        dates.day = moment(custom_dates.from).date();
    } else {
        dates = EDS.dateFilterSetup(Constants.Meters.filters.monthAVG);
    }
    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end=" +dates.end 
    service.devices.forEach((device, index) => {
        if (index !== 0) {
            serviceToCall += "?var="+device.name+".EPimp"+"?var="+device.name+".EQimp";
        }
    });
    serviceToCall += "?period=" + dates.period;

    // console.log('service to call:', serviceToCall);
    xhr.open('GET', serviceToCall);
    setTimeout(() => {
        if (xhr.readyState < 3) {
            xhr.abort();
        }
    }, 4000);
    xhr.onload = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            const reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
            let P = 0;
            let Q = 0;
            if(reading.recordGroup.record){
                let iterate = reading.recordGroup.record;
                if (Array.isArray(iterate)) {
                    iterate = iterate[0];
                }
                iterate.field.map(read => {
                    const type = read.id._text.split('.')[1];
                    let value = parseFloat(read.value._text);
                    if (type === 'EPimp') {
                        P += value;
                    } else {
                        Q += value;
                    }
                });
                const fp = (fpFormula(P, Q)*100).toFixed(2);
                const reactive = Q.toFixed(2);

                cb(null, {fp, reactive});
            } else {
                cb(null, null);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            cb(null, null);
        }
    };
    xhr.onerror = function() {
        if (isSingleCompany) cb({ status: 500, message: 'Error al leer medidor' }, null);
        else cb(null, null);
    };
    xhr.onabort = function () {
        console.error("The request timed out in fpReadings");
    };
    xhr.send();
}

const monthlyReadings = function(meter, service, isSingleCompany, custom_dates, cb) {
    let xhr = new XMLHttpRequest();
    let dates;
    if (custom_dates.from && custom_dates.until) {
        dates = EDS.dateFilterSetup(Constants.Meters.filters.custom, custom_dates);
        const daysInMonth = moment(custom_dates.from).daysInMonth();
        dates.period = daysInMonth*86400;
        dates.day = moment(custom_dates.until).date();
        dates.hour = 0;
    } else {
        dates = EDS.dateFilterSetup(Constants.Meters.filters.monthAVG);
    }
    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
        +dates.end;
    service.devices.forEach((device, index) => {
        if (index !== 0) {
            serviceToCall += "?var="+ device.name + ".EPimp";
        }
    });
    serviceToCall = serviceToCall + "?period=" + dates.period;
    xhr.open('GET', serviceToCall);
    setTimeout(() => {
        if (xhr.readyState < 3) {
            xhr.abort();
        }
    }, 4000);
    xhr.onload = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
            let summatory = 0;
            if(reading.recordGroup.record){
                let iterate = reading.recordGroup.record;
                if (Array.isArray(iterate)) {
                    iterate = iterate[0];
                }
                if (!Array.isArray(iterate.field)) {
                    iterate = [iterate.field];
                } else {
                    iterate = iterate.field;
                }
                Object.keys(iterate).forEach(function(key) {
                    summatory += parseInt(iterate[key].value._text);
                });
                
                let consumption = parseInt(summatory);
                let distribution = ( consumption / ((dates.hour + dates.day * 24) * CHARGE_FACTOR) );
                
                distribution = distribution.toFixed(2);
                consumption = consumption.toFixed(2);

                let monthlyReadings = {};

                monthlyReadings.distribution = distribution;
                monthlyReadings.consumption = consumption;

                Meters.getDpReadingsByFilter(meter.meter_id, '', service.serviceName, 3, {}, (err, res) => {
                    let maxDp = 0;
                    res.forEach((dpReading) => {
                        if (dpReading.isPeak && parseFloat(dpReading.value) > maxDp) {
                            maxDp = parseFloat(dpReading.value);
                        }
                    });

                    monthlyReadings.capacity = Math.min(maxDp, parseFloat(distribution));

                    cb(null, monthlyReadings);
                });
            } else {
                cb(null, null);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            cb(null, null);
        }
    };
    xhr.onerror = function() {
        if (isSingleCompany) cb({ status: 500, message: 'Error al leer medidor' }, null);
        else cb(null, null);
    };
    xhr.onabort = function () {
        console.error("The request timed out in monthly readings");
    };
    xhr.send();
}

module.exports.fpReadings = fpReadings;
module.exports.monthlyReadings = monthlyReadings;