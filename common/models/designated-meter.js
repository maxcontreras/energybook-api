'use strict';
const https = require('https');

const devicesRequests = require('../devicesRequests.js');
const moment = require('moment-timezone');
const async = require('async');
const app = require('../../server/server.js');
const Meters = app.loopback.getModel('Meter');
const Constants = require('./../../server/constants.json');
const EDS = require('../../server/modules/eds-connector');
const READINGS = require('../../server/modules/eds-readings');
const WS = require('../../server/boot/websockets');
var Socket = new WS;
const Converter = require('xml-js');

const API_PREFIX = "/services/user/";
const DEFAULT_HOURS = 24;
const DEFAULT_DAYS = 1;
const CHARGE_FACTOR = Constants.CFE.values.charge_factor;
const emissionFactor = Constants.CFE.values.emission_factor;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
const timezone = 'America/Mexico_City';

module.exports = function(Designatedmeter) {

    Designatedmeter.consumptionSummary = function consumptionSummary(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    let xhr = new XMLHttpRequest();
                    let devicesDescription = {};
                    let dates = EDS.dateFilterSetup(Constants.Meters.filters.month);
                    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml"+"?begin="+dates.begin+"?end="+dates.end;
                    service.devices.forEach((device, index) => {
                        if (index !== 0) {
                            devicesDescription[device.name] = device.description;
                            serviceToCall += "?var="+ device.name + ".EPimp";
                        }
                    });
                    serviceToCall += "?period="+dates.period;
                    xhr.open('GET', serviceToCall);
                    setTimeout(() => {
                        if (xhr.readyState < 3) {
                            xhr.abort();
                        }
                    }, 4000);
                    xhr.onload = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            if(reading.recordGroup && reading.recordGroup.record){
                                let read = {};
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    iterable.push(reading.recordGroup.record);
                                } else {
                                    iterable = reading.recordGroup.record;
                                }
                                iterable.map((item) => {
                                    let key = 0;
                                    let itemIterable = [];
                                    if (!Array.isArray(item.field)) {
                                        itemIterable.push(item.field);
                                    } else {
                                        itemIterable = item.field;
                                    }
                                    for (let device of itemIterable) {
                                        const name = devicesDescription[device.id._text.split(".")[0]];
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
                                let consumptionSummatory = {}
                                Object.keys(read).forEach(key => {
                                    consumptionSummatory[key] = read[key];
                                });
        
                                let company_id = meter.company().id;
                                service.updateAttribute(
                                    "consumptionSummary",
                                    consumptionSummatory, (err, updated) => {
                                        if(err) return nextService(err);
                                        let socketData = {
                                            socketEvent: 'consumptionSummary',
                                            data: updated.consumptionSummary,
                                            service: updated.serviceName
                                        };
                                        socketData = JSON.stringify(socketData);
                                        Socket.sendMessageToCompanyUsers(company_id, socketData);
                                        nextService();
                                });
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            var reading = {};
                            nextService();
                        }
                    };
                    xhr.onerror = function() {
                        if (meters.length === 1) nextService({ status: 500, message: 'Error al leer medidor' });
                        else nextService();
                    };
                    xhr.onabort = function () {
                        console.error(`The request timed out in consumption summary in company ${meter.company().company_name}`);
                    };
                    xhr.send();
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    let xhr = new XMLHttpRequest();
                    var dates = EDS.dateFilterSetup(Constants.Meters.filters.dayAVG);
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
                            if(reading.recordGroup && reading.recordGroup.record){
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record.field)) {
                                    iterable.push(reading.recordGroup.record.field);
                                } else {
                                    iterable = reading.recordGroup.record.field;
                                }
                                iterable.map(item=> {
                                    summatory += parseFloat(item.value._text);
                                });
                                let commonFormula = ( parseInt(summatory) / (dates.hour * DEFAULT_DAYS * CHARGE_FACTOR) );
                                let consumption = summatory
                                let distributionCharge = commonFormula * Constants.CFE.values.distribution_price;
                                commonFormula = commonFormula.toFixed(2);
                                distributionCharge = distributionCharge.toFixed(2);
                                consumption = consumption.toFixed(2);

                                let dailyReadings = {};
                                dailyReadings.lastUpdated = moment().format();

                                dailyReadings.chargeDistribution = distributionCharge;

                                dailyReadings.consumption = consumption;

                                let company_id = meter.company().id;

                                Meters.standardReadings(meter.meter_id, '', service.serviceName, Constants.Readings.variables.Demanda, 0, 900, {}, (err, res) => {
                                    let maxDpPeak = 0;
                                    let maxDpMonth = 0;
                                    res.forEach((dpReading) => {
                                        if (dpReading.isPeak && parseFloat(dpReading.value) > maxDpPeak) {
                                            maxDpPeak = parseFloat(dpReading.value);
                                        }
                                        if (parseFloat(dpReading.value) > maxDpMonth) {
                                            maxDpMonth = parseFloat(dpReading.value);
                                        }
                                    });
                                    dailyReadings.capacity = Math.min(maxDpPeak, parseFloat(commonFormula));
                                    dailyReadings.distribution = Math.min(maxDpMonth, parseFloat(commonFormula));
                                    service.updateAttribute(
                                        "dailyReadings",
                                        dailyReadings, (err, updated) => {
                                            if(err) return nextService(err);
                                            let socketData = {
                                                socketEvent: 'dailyReading',
                                                data: updated.dailyReadings,
                                                service: updated.serviceName
                                            };
                                            socketData = JSON.stringify(socketData);
                                            Socket.sendMessageToCompanyUsers(company_id, socketData);
                                            nextService();
                                    });
                                });
                            } else {
                                nextService();
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            nextService();
                        }
                    };
                    xhr.onerror = function() {
                        if (meters.length === 1) nextService({ status: 500, message: 'Error al leer medidor' });
                        else nextService();
                    };
                    xhr.onabort = function () {
                        console.error(`The request timed out in daily readings in company ${meter.company().company_name}`);
                    };
                    xhr.send();
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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

    Designatedmeter.carbonFootprint = function carbonFootprint(company_id, service_name, cb) {
        /** returns a json object that includes the following data
         *  consumption, generation, total,co2Limit
         *  emissionFactor and co2e
         *  Receives a company_id and a service name/device name as second parameter
        */
        const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        const Services = app.loopback.getModel('Service');
        let dR = new devicesRequests();
        
        let consumption;
        let generation; 
        let total;
        const co2Limit = 25000;
        let cO2Emissions;

        //find the company designatedMeter
        DesignatedMeter.find({
            where: {
                'company_id': company_id
            }    
        }).then(designatedMeter => {
            designatedMeter = designatedMeter[0];
            Services.find({
                where: {
                    'designatedMeterId': designatedMeter.id,
                    'serviceName': service_name
                }
            }).then(service => {
                //check if its service
                if (service.length > 0) {
                    service = service[0];
                    Promise.all([
                        //retrieve EPimp
                        new Promise((resolve, reject) => {
                            dR.getData(
                                designatedMeter.hostname,
                                EDS.dateFilterSetup(Constants.Meters.filters.dayAVG),
                                API_PREFIX,
                                service.devices,
                                [
                                    'EPimp'
                                ]
                            )
                            .then(reading => {
                                if(reading.recordGroup && reading.recordGroup.record){
                                    let iterable = [];
                                    if (!Array.isArray(reading.recordGroup.record.field)) {
                                        iterable.push(reading.recordGroup.record.field);
                                    } else {
                                        iterable = reading.recordGroup.record.field;
                                    }
                                    let summatory = 0;
                                    iterable.map(item => {
                                        summatory += parseFloat(item.value._text);
                                    });
                                    resolve(summatory);
                                } else {
                                    resolve(0);
                                }
                            })
                            .catch(err => {
                                reject();
                            })
                        }),
                        //retrieve EPgen
                        new Promise((resolve, reject) => {
                            if (service['generationDevices'] !== undefined) {
                                dR.getData(
                                    designatedMeter.hostname,
                                    EDS.dateFilterSetup(Constants.Meters.filters.dayAVG),
                                    API_PREFIX,
                                    service.generationDevices,
                                    [
                                        'EPgen'
                                ])    
                            } else {
                                generation = 0;
                                resolve(generation);
                            }
                        })
                        .then(reading => {
                            if(reading === 0){
                                return reading;
                            }

                            if(reading.recordGroup && reading.recordGroup.record){
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record.field)) {
                                    iterable.push(reading.recordGroup.record.field);
                                } else {
                                    iterable = reading.recordGroup.record.field;
                                }
                                let summatory = 0;
                                iterable.map(item => {
                                    summatory += parseFloat(item.value._text);
                                });
                                resolve(summatory);
                            } else {
                                resolve(0);
                            }
                        })
                    ])
                    .then((data) => {
                        consumption = data[0];
                        generation = data[1];
                        total = consumption - generation;
                        cO2Emissions = emissionFactor * (parseFloat(consumption)/1000.0);
                        let response = {
                            consumption,
                            generation,
                            total,
                            cO2Emissions,
                            emissionFactor,
                            co2Limit
                        }
                        //console.log(response);
                        cb(null, response);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                } else {
                    //if it's not a service it's a device
                    let deviceName = service_name;
                    let meter = designatedMeter.devices.find((device) => {
                        return device.name == deviceName;
                    });
                    let isEPgenDevice;
                    if (designatedMeter['generationDevices'] === undefined) {
                        isEPgenDevice = false;
                    } else {
                        let aux;
                        aux = designatedMeter.generationDevices.find((device) => {
                            return device === deviceName;
                        });
                        if (aux === undefined) {
                            isEPgenDevice = false;
                        }  else {
                            isEPgenDevice = true;
                        }
                    }

                    Promise.all([
                        //EPimp
                        new Promise((resolve, reject) => {
                            if(isEPgenDevice) {
                                resolve(0);
                                return;
                            }
                            dR.getData(
                                designatedMeter.hostname,
                                EDS.dateFilterSetup(Constants.Meters.filters.dayAVG),
                                API_PREFIX,
                                meter,
                                [
                                    'EPimp'
                                ]
                            )
                            .then((reading) => {
                                if(reading.recordGroup && reading.recordGroup.record){
                                    let iterable = [];
                                    if (!Array.isArray(reading.recordGroup.record.field)) {
                                        iterable.push(reading.recordGroup.record.field);
                                    } else {
                                        iterable = reading.recordGroup.record.field;
                                    }
                                    let summatory = 0;
                                    iterable.map(item => {
                                        summatory += parseFloat(item.value._text);
                                    });
                                    resolve(summatory);
                                } else {
                                    resolve(0);
                                }
                            })
                        }),
                        //EPGEN
                        new Promise((resolve, reject) => {
                            if(!isEPgenDevice){
                                resolve(0);
                                return;
                            }
                            dR.getData(
                                designatedMeter.hostname,
                                EDS.dateFilterSetup(Constants.Meters.filters.dayAVG),
                                API_PREFIX,
                                meter,
                                [
                                    'EPgen'
                                ]
                            ).then((reading) => {
                                if(reading.recordGroup && reading.recordGroup.record){
                                    let iterable = [];
                                    if (!Array.isArray(reading.recordGroup.record.field)) {
                                        iterable.push(reading.recordGroup.record.field);
                                    } else {
                                        iterable = reading.recordGroup.record.field;
                                    }
                                    let summatory = 0;
                                    iterable.map(item => {
                                        summatory += parseFloat(item.value._text);
                                    });
                                    resolve(summatory);
                                } else {
                                    resolve(0);
                                }
                            })
                        })

                    ])
                    .then((data) => {
                        consumption = data[0];
                        generation = data[1];
                        total = consumption - generation;
                        cO2Emissions = emissionFactor * (parseFloat(consumption)/1000.0);
                        let response = {
                            consumption,
                            generation,
                            total,
                            cO2Emissions,
                            emissionFactor,
                            co2Limit
                        }
                        //console.log(response);
                        cb(null, response);
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }
            })
        });
    }

    Designatedmeter.remoteMethod(
        'carbonFootprint', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''},
                { arg: 'service_name', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'object' },
            http: {path: '/carbonFootprint', verb: 'get'}
        }
    );

    Designatedmeter.generation = function generation(company_id, service_name, device_name, cb) {
        /** returns a json object that includes the following data
             *  generation, selfConsumption, networkInjection
             *  emissionFactor and co2e
             *  Receives a company_id and a service name/device name as second parameter
        */

        if(service_name !== undefined && device_name !== undefined) {
            return cb("Make a request for a service or a device, not both", null);
        }

        const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        const Services = app.loopback.getModel('Service');
        let dR = new devicesRequests();
        
        //initialization
        let generation = 0;
        let generationValue = 0;
        let selfConsumption = 0;
        let selfConsumptionValue = 0;
        let networkInjection = 0;
        let networkInjectionValue = 0;
        let co2e = 0;

        //find the company designatedMeter
        DesignatedMeter.find({
            where: {
                'company_id': company_id
            },    
            include: [
                {
                    relation: 'company'
                }
            ]
        }).then(designatedMeter => {
            if (designatedMeter === undefined || designatedMeter.length === 0) {
                return cb("There's no company with " + company_id + " id");
            }
            designatedMeter = designatedMeter[0];

            new Promise((resolve, reject) => {
                if(service_name !== undefined) {
                    Services.find({
                        where: {
                            'designatedMeterId': designatedMeter.id,
                            'serviceName': service_name
                        }
                    }).then(service => {   
                        if (service === undefined || service.length === 0) {
                            return reject("There's not a service with " + company_id + " id and " + service_name + " name");
                        } 
                        service = service[0];
                        return resolve(service.devices);
                    });
                } else if (device_name !== undefined) {
                    let device = designatedMeter.devices.find(device => {
                        return device.name === device_name;
                    });
                    if (device === undefined) {
                        return reject("There's not a device with " + company_id + " id and " + device_name + " name");
                    }
                    return resolve([device]);
                } else {
                    return reject("There's not a service or device in the request");
                }    
            })
            .then(devices => {
                let EPgenDevices = [];
                    
                if (designatedMeter['generationDevices'] !== undefined || designatedMeter.generationDevices.length !== 0) {
                    let dMEPgenDevices = new Set(designatedMeter.generationDevices);
                    let tmpDevices = devices;
                    devices = [];

                    tmpDevices.forEach((device) => {
                        if (dMEPgenDevices.has(device.name)) {
                            EPgenDevices.push(device);
                        } else {
                            devices.push(device);
                        }
                    });
                }
                // console.log("devices:");
                // console.log(devices);
                // console.log("EPgenDevices: ");
                // console.log(EPgenDevices);
                
                Promise.all([
                    //generation
                    new Promise((resolve, reject) => {
                        let dates = EDS.dateFilterSetup(Constants.Meters.filters.dayAVG);
                        dates.period = 3600;

                        dR.getData(
                            designatedMeter.hostname,
                            dates,
                            API_PREFIX,
                            EPgenDevices,
                            [
                                'EPGen'
                            ]
                        )
                        .then(reading => {
                            if (reading && reading.recordGroup && reading.recordGroup.record) {
                                let records = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    records.push(reading.recordGroup.record)
                                } else {
                                    records = reading.recordGroup.record;
                                }
                                async.eachSeries(records, async item => {
                                    const day = item.dateTime._text.slice(0,2);
                                    const month = item.dateTime._text.slice(2,4);
                                    const year = item.dateTime._text.slice(4,8);
                                    const hour = item.dateTime._text.slice(8,10);
                                    const minute = item.dateTime._text.slice(10,12);
                                    const second = item.dateTime._text.slice(12,14);
                                    const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                                    const CFE_rates = await EDS.getCFERate(tmp_date, designatedMeter.company().city, designatedMeter.company().tariff_type);
                                    const rate = CFE_rates.rate;

                                    let iterable = [];
                                    if (!Array.isArray(item.field)) {
                                        iterable.push(item.field);
                                    } else {
                                        iterable = item.field;
                                    }
                                    let summatory = 0;
                                    iterable.map(item => {
                                        summatory += parseFloat(item.value._text);
                                    });
                                    generation += summatory;
                                    generationValue += summatory * rate;
    
                                }, err => {
                                    if (err) return cb(err, null);
                                    resolve({generation, generationValue}); 
                                });
                            } else {
                                resolve({generation, generationValue});
                            }
                            
                        })
                        .catch(err => {
                            return cb(err, null);
                        });
                    }),
                    //networkInjection
                    new Promise((resolve, reject) => {
                        let dates = EDS.dateFilterSetup(Constants.Meters.filters.dayAVG);
                        dates.period = 3600;

                        dR.getData(
                            designatedMeter.hostname,
                            dates,
                            API_PREFIX,
                            devices,
                            [
                                'EPexp',
                                'EPimp'
                            ]
                        )
                        .then((reading) => {
                            if (reading && reading.recordGroup && reading.recordGroup && reading.recordGroup.record) {
                                let records = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    records.push(reading.recordGroup.record)
                                } else {
                                    records = reading.recordGroup.record;
                                }
                                async.eachSeries(records, async item => {
                                    const day = item.dateTime._text.slice(0,2);
                                    const month = item.dateTime._text.slice(2,4);
                                    const year = item.dateTime._text.slice(4,8);
                                    const hour = item.dateTime._text.slice(8,10);
                                    const minute = item.dateTime._text.slice(10,12);
                                    const second = item.dateTime._text.slice(12,14);
                                    const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                                    
                                    const CFE_rates = await EDS.getCFERate(tmp_date, designatedMeter.company().city, designatedMeter.company().tariff_type);
                                    const rate = CFE_rates.rate;

                                    let iterable = [];
                                    if (!Array.isArray(item.field)) {
                                        iterable.push(item.field);
                                    } else {
                                        iterable = item.field;
                                    }
                                    let summatoryEPimp = 0;
                                    let summatoryEPexp = 0;
                                    let varName;
                                    iterable.map(item => {
                                        varName = item.id._text.split(".")[1];
                                        if (varName == "EPimp") {
                                            summatoryEPimp += parseFloat(item.value._text);
                                        } else if (varName == "EPexp") {
                                            summatoryEPexp += parseFloat(item.value._text);
                                        } 
                                    });
                                    networkInjection += summatoryEPexp;
                                    networkInjectionValue += summatoryEPexp * rate;
                                    co2e += emissionFactor * (summatoryEPimp / 1000);

                                }, err => {
                                    if (err) return cb(err, null);
                                    resolve({
                                        networkInjection,
                                        co2e
                                    });    
                                });
                            }
                        }).catch(err => {
                            return cb(err, null);
                        })
                    })
                ])
                .then((res) => {
                    selfConsumptionValue = generationValue - networkInjectionValue;
                    selfConsumption = generation - networkInjection;
                    cb(null, {
                        generation,
                        networkInjection,
                        selfConsumption,
                        co2e,
                        emissionFactor,
                        generationValue,
                        networkInjectionValue,
                        selfConsumptionValue
                    });
                })
            })
            .catch(err => {
                return cb(err, null);
            })
        });
    }

    Designatedmeter.remoteMethod(
        'generation', {
            accepts: [
                { arg: 'company_id', type: 'string',  required: false, default: ''},
                { arg: 'service_name', type: 'string',  required: false, default: ''},
                { arg: 'device_name', type: 'string',  required: false, default: ''}
            ],
            returns: { arg: 'response', type: 'object' },
            http: {path: '/generation', verb: 'get'}
        }
    );
    
    Designatedmeter.epimpHistory = function epimpHistory(company_id, cb) {
        Meters.getActivesAssigned(company_id, function(err, meters) {
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    let xhr = new XMLHttpRequest();
                    let dates = EDS.dateFilterSetup(Constants.Meters.filters.month);
                    let serviceToCall = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="+dates.end;
                    service.devices.forEach((device, index) => {
                        if (index !== 0) {
                            serviceToCall += "?var="+ device.name + ".EPimp";
                        }
                    });
                    serviceToCall += "?period=" +dates.period;
                    xhr.open('GET', serviceToCall);
                    setTimeout(() => {
                        if (xhr.readyState < 3) {
                            xhr.abort();
                        }
                    }, 4000);
                    xhr.onload = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            let reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            if (reading.recordGroup && reading.recordGroup.record) {
                                let epimp = {};
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    iterable.push(reading.recordGroup.record);
                                } else {
                                    iterable = reading.recordGroup.record;
                                }
                                iterable.map( (item, key) => {
                                    let read = {};
                                    if(item.field){
                                        let iterable = [];
                                        if (!Array.isArray(item.field)) {
                                            iterable.push(item.field);
                                        } else {
                                            iterable = item.field;
                                        }
                                        read.value = 0;
                                        iterable.map(device => {
                                            read.value += parseFloat(device.value._text);
                                        });
                                        read.value = read.value.toFixed(2);
                                    } else {
                                        read.value = "0";
                                    }
                                    read.date = item.dateTime._text;
                                    epimp[key] = read;
                                });
                                let company_id = meter.company().id;

                                service.updateAttribute("epimp", epimp, (err, updated) => {
                                    if (err) return nextService(err);
                                    let socketData = {
                                        socketEvent: 'epimpHistoryReading',
                                        data: updated.epimp,
                                        service: updated.serviceName
                                    };
                                    socketData = JSON.stringify(socketData);
                                    Socket.sendMessageToCompanyUsers(company_id, socketData);
                                    nextService();
                                });
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            nextService();
                        }
                    };
                    xhr.onerror = function() {
                        if (meters.length === 1) nextService({ status: 500, message: 'Error al leer medidor' });
                        else nextService();
                    };
                    xhr.onabort = function () {
                        console.error(`The request timed out in epimpHistory in company ${meter.company().company_name}`);
                    };
                    xhr.send();
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    READINGS.fpReadings(meter, service, meters.length === 1, {}, (err, readings) => {
                        if (err) {
                            nextService(err);
                        } else if (readings) {
                            const company_id = meter.company().id;
                            service.updateAttributes({fp: readings.fp, reactive: readings.reactive}, (err, updated) => {
                                if(err) return nextService();
                                let socketData = {
                                    socketEvent: 'powerFactor',
                                    data: updated.fp,
                                    service: updated.serviceName
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                socketData = {
                                    socketEvent: 'reactive',
                                    data: updated.reactive,
                                    service: updated.serviceName
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                nextService();
                            });
                        } else {
                            nextService();
                        }
                    });
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    READINGS.monthlyReadings(meter, service, meters.length === 1, {}, (err, monthlyReadings) => {
                        if (err) {
                            nextService(err);
                        } else if (monthlyReadings) {
                            const company_id = meter.company().id;
                            service.updateAttribute("monthlyReadings", monthlyReadings, (err, updated) => {
                                if(err) return nextService();
                                let socketData = {
                                    socketEvent: 'monthlyReading',
                                    data: updated.monthlyReadings,
                                    service: updated.serviceName
                                };
                                socketData = JSON.stringify(socketData);
                                Socket.sendMessageToCompanyUsers(company_id, socketData);
                                nextService();
                            });
                        } else {
                            nextService();
                        }
                    });
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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
            async.eachSeries(meters, function(meter, next){
                const services = meter.services();
                async.eachSeries(services, (service, nextService) => {
                    let xhr = new XMLHttpRequest();
                    let serviceToCall = `${meter.hostname}${API_PREFIX}values.xml`;
                    service.devices.forEach((device, index) => {
                        if (index !== 0) {
                            serviceToCall += "?var="+ device.name + ".DP";
                        }
                    });
                    xhr.open('GET', serviceToCall);
                    setTimeout(() => {
                        if (xhr.readyState < 3) {
                            xhr.abort();
                        }
                    }, 4000);
                    xhr.onload = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            let iterable = [];
                            if (!Array.isArray(reading.values.variable)) {
                                iterable.push(reading.values.variable);
                            } else {
                                iterable = reading.values.variable;
                            }
                            let dp = iterable.reduce((prev, curr) => prev + parseFloat(curr.value._text), 0);
                            dp = parseFloat(dp / 1000);
                            if(dp) {
                                dp = dp.toFixed(2);
                                
                                let company_id = meter.company().id;

                                service.updateAttribute("dp", dp, (err, updated) => {
                                    if (err) return nextService(err)
                                    let socketData = {
                                        socketEvent: 'odometerReading',
                                        data: updated.dp,
                                        service: updated.serviceName
                                    };
                                    socketData = JSON.stringify(socketData);
                                    Socket.sendMessageToCompanyUsers(company_id, socketData);
                                    nextService();
                                });
                            } else {
                                nextService();
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            var reading = {};
                            nextService();
                        }
                    };
                    xhr.onerror = function() {
                        if (meters.length === 1) nextService({ status: 500, message: 'Error al leer medidor' });
                        else nextService();
                    };
                    xhr.onabort = function () {
                        console.error(`The request timed out in odometerReadings in company ${meter.company().company_name}`);
                    };
                    xhr.send();
                }, function(errService) {
                    if (errService) next(errService)
                    else next();
                });
            }, function(_err) {
                if(_err) {
                    console.log('error reading', _err);
                    cb(_err, null);
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

    Designatedmeter.setDeviceDescriptions = function setDeviceDescription(meterId, cb) {
        const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        DesignatedMeter.find({
            where: {
                id: meterId
            }
        })
            .then(meters => {
                async.each(meters, (meter, next) => {
                    let serviceToCall = meter.hostname+API_PREFIX+'deviceInfo.xml';
                    meter.devices.forEach((device, index) => {
                        let id = device;
                        if (device.name && device.description) {
                            id = device.name;
                        }
                        serviceToCall += `?id=${id}`;
                    });
                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', serviceToCall);
                    setTimeout(() => {
                        if (xhr.readyState < 3) {
                            xhr.abort();
                        }
                    }, 4000);
                    xhr.onload = function() {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            const reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            meter.devices = reading.devices.device.map(device => 
                                ({
                                    name: device.id._text,
                                    description: (device.description)? device.description._text: 'EDS'
                                })
                            );
                            meter.devices.push()
                            meter.save(function(err, dsgMeter){
                                next();
                            });
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            next();
                        }
                    }
                    xhr.onerror = function() {
                        console.log('An error occurred while opening the request');
                        next();
                    };
                    xhr.send();
                }, (err => {
                    if (err) return cb({ status: 501, message: 'Error al guardar descripción de un dispositivo' });
                    cb(null, 'OK');
                }));
            });
    }

    Designatedmeter.remoteMethod(
        'setDeviceDescriptions', {
            accepts: [
                {arg: 'meterId', type: 'string', required: false}
            ],
            returns: {arg: 'result', type: 'string'}
        }
    );

    Designatedmeter.deleteMeterWithServices = function deleteMeterWithServices(meterId, cb) {
        const Services = app.loopback.getModel('Service');

        Designatedmeter.findById(meterId, { include: ['meter', 'services'] }, (err, dsgMeter) => {
            if (err) return cb(err);
            if (dsgMeter) {
                const services = dsgMeter.services();
                const meter = dsgMeter.meter();

                async.waterfall([
                    function deleteMeter(next) {
                        Meters.destroyById(meter.id, err => {
                            if (err) console.log('Error while deleting meter');
                            next();
                        });
                    },
                    function deleteServices(next) {
                        async.each(services, (service, nextService) => {
                            Services.destroyById(service.id, err => {
                                if (err) console.log('Error while deleting service');
                                nextService();
                            })
                        }, next);
                    },
                    function deleteDesignatedMeter(next) {
                        Designatedmeter.destroyById(meterId, err => {
                            if (err) next(err);
                            else next();
                        })
                    }
                ], function (err) {
                    if (err) cb(err);
                    else cb(null, 'Designated Meter deleted succesfully');
                });
            } else {
                cb({ status: 404, message: 'DesignatedMeter not found' });
            }
        });
    }

    Designatedmeter.remoteMethod(
        'deleteMeterWithServices', {
            accepts: [
                { arg: 'meterId', type: 'string' }
            ],
            returns: { arg: 'result', type: 'string' }
        }
    );
};
