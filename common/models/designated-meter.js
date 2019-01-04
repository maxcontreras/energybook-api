'use strict';
const https = require('https');

const moment = require('moment-timezone');
const async = require('async');
const app = require('../../server/server.js');
const Meters = app.loopback.getModel('Meter');
const Constants = require('./../../server/constants.json');
const EDS = require('../../server/modules/eds-connector');
const WS = require('../../server/boot/websockets');
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

const fpFormula = function(P, Q) {
    return P/Math.sqrt(Math.pow(P, 2) + Math.pow(Q, 2));
}


module.exports = function(Designatedmeter) {

    Designatedmeter.consumptionSummary = function consumptionSummary(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
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
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    };

    Designatedmeter.remoteMethod(
        'consumptionSummary', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' } 
        }
    );

    Designatedmeter.dailyReadings = function dailyReadings(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
            async.each(meters, function(meter, next){
                var dates = EDS.dateFilterSetup(Constants.Meters.filters.dayAVG);
                let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                    +dates.end;
                Object.keys(meter.devices).forEach(function(key) {
                    serviceToCall += "?var="+ meter.devices[key] + ".EPimp";
                });
                serviceToCall = serviceToCall + "?period=" + dates.period;
                // console.log('service to call:', serviceToCall);
                xhr.open('GET', serviceToCall, false);
                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                        let summatory = 0;
                        if(reading.recordGroup.record){
                            reading.recordGroup.record.field.map(item=> {
                                summatory += parseFloat(item.value._text);
                            });
    
                            let distribution = ( parseInt(summatory) / (dates.hour * DEFAULT_DAYS * CHARGE_FACTOR) );
                            let consumption = summatory
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
                            // console.log('daily consumption: '+ meter.device_name + ': value => ' + meter.latestValues.consumption);
                            let company_id = meter.company().id;
                            meter.unsetAttribute("company");
                            meter.unsetAttribute("meter");
                            meter.save(function(err, dsgMeter){
                                if(err) next(err, null);
                                else {
                                    let socketData = {
                                        socketEvent: 'dailyReading',
                                        data: dsgMeter.latestValues
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
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    };

    Designatedmeter.remoteMethod(
        'dailyReadings', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' }
        }
    );

    Designatedmeter.epimpHistory = function epimpHistory(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
            async.each(meters, function(meter, next){
                let dates = EDS.dateFilterSetup(Constants.Meters.filters.month);
                let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="+dates.end;
                meter.devices.map(device => {
                    serviceToCall += "?var="+device+".EPimp";
                });
                serviceToCall += "?period=" +dates.period;
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
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    };

    Designatedmeter.remoteMethod(
        'epimpHistory', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' }
        }
    );

    Designatedmeter.fpReadings = function fpReadings(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
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
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    };

    Designatedmeter.remoteMethod(
        'fpReadings', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' }
        }
    );

    Designatedmeter.monthlyReadings = function monthlyReadings(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
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
                            let iterate = reading.recordGroup.record;
                            if (Array.isArray(iterate)) {
                                iterate = iterate[0];
                            }
                            Object.keys(iterate.field).forEach(function(key) {
                                summatory += parseInt(iterate.field[key].value._text);
                            });
                            const day = iterate.dateTime._text.slice(0,2);
                            const month = iterate.dateTime._text.slice(2,4);
                            const year = iterate.dateTime._text.slice(4,8);
                            const hour = iterate.dateTime._text.slice(8,10);
                            const minute = iterate.dateTime._text.slice(10,12);
                            const second = iterate.dateTime._text.slice(12,14);
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
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    }

    Designatedmeter.remoteMethod(
        'monthlyReadings', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' }
        }
    );

    Designatedmeter.odometerReadings = function odometerReadings(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
            async.each(meters, function(meter, next){
                let serviceToCall = meter.hostname+ API_PREFIX +"values.xml" + "?var=" +meter.summatory_device+ "." +Constants.Meters.common_names.summatory_dp;
                // console.log('serviceToCall:', serviceToCall);
    
                xhr.open('GET', serviceToCall, false);
                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                        let dp = ( parseFloat(reading.values.variable.value._text) / 1000 );
                        if(dp){
                            dp = dp.toFixed(2);
                            meter.latestValues.lastUpdated = new Date();
                            if(!meter.latestValues.dp){
                                meter.latestValues.dp = {};
                                meter.latestValues.dp.value = dp;
                            } else {
                                meter.latestValues.dp.value = dp;
                            }
    
                            let company_id = meter.company().id;
                            meter.unsetAttribute("company");
                            meter.unsetAttribute("meter");
                            meter.save(function(err, dsgMeter){
                                let socketData = {
                                    socketEvent: 'odometerReading',
                                    data: meter.latestValues.dp
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                next();
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
                if(_err) {
                    console.log('error reading', _err);
                    cb({ status: 500, message: 'Error al leer medidores' }, null);
                }
                cb(null, 'OK');
            });
        });
    };

    Designatedmeter.remoteMethod(
        'odometerReadings', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'string' }
        }
    );

    Designatedmeter.getWeather = function getWeather(lat, lon, cb) {
        const API_URL = 'da79653f5a5cf0558734cee7b31bd0d7';
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&APPID=${API_URL}`;

        let req = https.get(url, (resp) => {
            let data = '';
            resp.setEncoding('utf8');
            
            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            // When the information has been received, send it back
            resp.on('end', () => {
                cb(null, JSON.parse(data));
            });
        });

        req.on('error', (err) => {
            cb({ status: 500, message: 'Couldnt retrieve data from weather api' });
        })
    };

    Designatedmeter.remoteMethod(
        'getWeather', {
            accepts: [
                { arg: 'lat', type: 'number' },
                { arg: 'lon', type: 'number' }
            ],
            returns: { arg: 'results', type: 'object' }
    });
};
