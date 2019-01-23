'use strict';

const Converter = require('xml-js');
const Cons = require('../constants.json');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const Constants = require('./../../server/constants.json');
const moment = require('moment-timezone');
const async = require('async');


const API_PREFIX = "/services/user/";
const DEFAULT_HOURS = 24;
const DEFAULT_DAYS = 1;
const CHARGE_FACTOR = Constants.CFE.values.charge_factor;

moment.tz.setDefault("America/Mexico_City");

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
const timezone = 'America/Mexico_City';

var performEDSrequest = function performEDSrequest(service, next){
    // Example URL: /services/user/devices.xml
    xhr.open('GET', service, false);
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            var newObj = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
            next(null, newObj);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            var newObj = {};
            next(true, null);
        }
    };
};

var getDeviceInfo = function getDeviceInfo(device, next){
    let serviceToCall = "deviceInfo.xml" + "?id=" + device.device_name;
    performEDSrequest(serviceToCall, function(err, response){
        let deviceInfo = response.devices.device;
        next(err, deviceInfo);
    });
};

var getAllDeviceVariables = function getAllDeviceVariables(device, next){
    let serviceToCall = "varInfo.xml" + "?id=" + device.device_name;
    performEDSrequest(serviceToCall, function(err, response){
        let deviceVars = response.varInfo;
        next(err, deviceVars);
    });
};

var readDemand = function readDemand(meter, next){
    var dates = dateFilterSetup(Constants.Meters.filters.monthAVG);
    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
        +dates.end+ "?var=" +meter.device_name+ ".EPimp?period=" +dates.period;

    console.log('serviceToCall Month:', serviceToCall);

    xhr.open('GET', serviceToCall, true);
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
            let demand = ( parseInt(reading.recordGroup.record.field.value._text) / (DEFAULT_HOURS * dates.day * CHARGE_FACTOR) );
            console.log('demand hereeee:', demand);
            if(demand){
                demand = demand.toFixed(2);
                next(null, demand);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            next(true, null);
        }
    };
};

var readEPimpHistory = function readEPimpHistory(meter, next){
    var dates = dateFilterSetup(Constants.Meters.filters.month);
    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
        +dates.end+ "?var=" +meter.device_name+ ".EPimp?period=" +dates.period;

    console.log('serviceToCall Month:', serviceToCall);

    xhr.open('GET', serviceToCall, true);
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
            let epimpHistory = [];
            Object.keys(reading.recordGroup.record).forEach(function(key) {
                let read = {};
                read.date = reading.recordGroup.record[key].dateTime._text;
                read.value = reading.recordGroup.record[key].field.value._text;
                epimpHistory.push(read);
            });
            if(epimpHistory){
                next(null, epimpHistory);
            }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            next(true, null);
        }
    };
};

/*
 * Example URL: http://ecg.dontexist.com/services/user/records.xml?begin=12072018?end=15082018?var=MEDIDOR%201.DP
 */
var panelReadings = function panelReadings(filter, meter, next){
    let dates = dateFilterSetup(Constants.Meters.filters.today);
    let response = [];
    let epimpService = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
        +dates.end+ "?var=" +meter.device_name+ ".EPimp?period=" +dates.period;
    let dpService = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
        +dates.end+ "?var=" +meter.device_name+ ".DP?period=" +dates.period;

    async.waterfall([
        function epimpRead(nxt){
            // performEDSrequest(epimpService, function(err, epimpReads){
            //     console.log('resssss');
            //     if(err) nxt(err, null);
            //     else {
            //         console.log('epimp: ', epimpReads);
            //         nxt(null, true);
            //     }
            // });
            xhr.open('GET', epimpService, false);
            xhr.send();
            console.log(epimpService);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log('over here');
                    var newObj = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                    next(null, newObj);
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    var newObj = {};
                    next(true, null);
                }
            };
        },
        function dpRead(pvt, nxt){
            console.log('here');
            performEDSrequest(dpService, function(err, dpReads){
                if(err) nxt(err, null);
                else {
                    console.log('dp: ', dpReads);
                    nxt(null, true);
                }
            });
        }
    ], function(err, response){
        console.log('response:', response);
        if(err) next(err, null);
        else {

        }
    });
};

// Receives a date in YYYY-MM-DD HH:mm:ss format and converts it into DDMMYYYYHHMMSS
var parseDate = function(date) {
    let newDate = date.split(/[: -]+/);
    return newDate[2]+newDate[1]+newDate[0]+newDate[3]+newDate[4]+newDate[5];
}

var dateFilterSetup = function dateFilterSetup(filter, dates = {}){
    // TODO: Investigar que putas con la agrupacion por periodo y agregarlo en obj date.
    let date = [];
    switch (filter) {
        case Constants.Meters.filters.today:
            date.begin = parseDate(moment().startOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 3600;
            return date;
        case Constants.Meters.filters.yesterday:
            date.begin = parseDate(moment().startOf("day").subtract(1, "days").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf("day").subtract(1, "days").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 3600;
            return date;
        case Constants.Meters.filters.week:
            date.begin = parseDate(moment().startOf('week').add(6,"hours").format('YYYY-MM-DD HH:mm:ss'));
            date.end = parseDate(moment().endOf('week').add(6,"hours").format('YYYY-MM-DD HH:mm:ss'));
            date.period = 86400;
            return date;
        case Constants.Meters.filters.month:
            date.begin = parseDate(moment().startOf('month').add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf('month').add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 86400;
            return date;
        case Constants.Meters.filters.year:
            date.begin = parseDate(moment().startOf('year').add(6,"hours").format('YYYY-MM-DD HH:mm:ss'));
            date.end = parseDate(moment().endOf('year').add(6,"hours").format('YYYY-MM-DD HH:mm:ss'));
            date.period = 86400;
            return date;
        // TODO: Update the following when the time comes
        case Constants.Meters.filters.custom:
            date.begin = parseDate(moment(dates.from).startOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment(dates.until).endOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 900;
            return date;
        case Constants.Meters.filters.latest:
            date.begin = parseDate(moment().startOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 5;
            return date;
        case Constants.Meters.filters.dayAVG:
            date.begin = parseDate(moment().startOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 86400;
            date.hour = moment().hour();
            return date;
        case Constants.Meters.filters.monthAVG:
            date.begin = parseDate(moment().startOf('month').add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf('month').add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            const daysInMonth = moment().daysInMonth();
            date.period = daysInMonth*86400;
            date.day = moment().date();
            return date;
        default:
            date.begin = parseDate(moment().startOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.end = parseDate(moment().endOf("day").add(6,"hours").format("YYYY-MM-DD HH:mm:ss"));
            date.period = 900;
            return date;
    }
}

const getCFERate = function(ISOdate) {
    let date = moment(ISOdate).tz(timezone);

    // get CFE period
    const period2 = {start: Constants.CFE.datePeriods[1].utc_startDate, end: Constants.CFE.datePeriods[1].utc_endDate};
    let curr_period = 0;
    if (date.isBetween(moment(period2.start, 'DD/MM/YYYY').tz(timezone), moment(period2.end, 'DD/MM/YYYY').tz(timezone), "days", "[]")) {
        curr_period = 1;
    }

    // get day of the week
    let curr_day = "monday-friday";
    if (date.day() === 0) {
        curr_day = "sunday";
    } else if (date.day() === 6) {
        curr_day = "saturday";
    }

    // obtain corresponding rate
    const rate_type = Constants.CFE.datePeriods[curr_period].rates[curr_day][date.hour()];
    const rate = Constants.CFE.values.consumption_price[rate_type];
    return {
        rate,
        rate_type,
        date
    }
}


module.exports.parseDate = parseDate;
module.exports.performEDSrequest = performEDSrequest;
module.exports.getDeviceInfo = getDeviceInfo;
module.exports.getAllDeviceVariables = getAllDeviceVariables;
module.exports.panelReadings = panelReadings;
module.exports.readDemand = readDemand;
module.exports.readEPimpHistory = readEPimpHistory;
module.exports.dateFilterSetup = dateFilterSetup;
module.exports.getCFERate = getCFERate;
