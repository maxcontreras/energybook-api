'use strict';

const app = require('./../../server/server.js');
const EDS = require('../../server/modules/eds-connector');
const async = require('async');
const API_PREFIX = "/services/user/";
const Converter = require('xml-js');
const moment = require('moment-timezone');
const Constants = require('./../../server/constants.json');

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

module.exports = function(Meter) {

    Meter.getOwnerCompany = function getOwnerCompany(meter_id, cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!meter_id){ cb({status: 400, message: 'Medidor no encontrado'}); }
        else {
            Meter.findById(meter_id, function(err, meter){
                if(!meter){ cb({status: 400, message: 'Medidor no encontrado'}); }
                else {
                    DesignatedMeter.findOne({
                        where: {
                            and: [
                                { meter_id: meter.id },
                                { active: 1 }
                            ]
                        },
                        include: [
                            {
                                relation: 'company'
                            },
                            {
                                relation: 'meter'
                            }
                        ]
                    }, function (err, designatedMeter){
                        if(!designatedMeter){ cb({status: 400, message: 'Medidor sin vinculación a compañía'}); }
                        else {
                            cb(null, {
                                name: designatedMeter.company().company_name,
                                legal_name: designatedMeter.company().legal_name,
                                meter_status: designatedMeter.active,
                                meter_serial_number: designatedMeter.meter().serial_number,
                                hostname: designatedMeter.hostname,
                            });
                        }
                    });
                }
            });
        }
    };

    Meter.remoteMethod(
        'getOwnerCompany', {
            accepts: [
                { arg: 'meter_id', type: 'string' }
            ],
            returns: { arg: 'company', type: 'object' }
        }
    );

    Meter.unassignedMeters = function unassignedMeters(cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        Meter.find({
            include: [
                {
                    relation: 'designatedMeters'
                }
            ]
        }, function(err, meters){
            if(err) cb({status: 400, message: "Error al traer los medidores"}, null);
            if(meters){
                let unassignedMeters = [];
                async.each(meters, function (meter, next) {
                    if(!meter.designatedMeters()[0]){
                        unassignedMeters.push(meter);
                    }
                    next();
                }, function () {
                    cb(null, unassignedMeters);
                });

            }
        });
    };

    Meter.remoteMethod('unassignedMeters', {
        returns: { arg: 'meters', type: 'object' },
        http: {path: '/unassignedMeters', verb: 'get'}
    });

    Meter.getActivesAssigned = function getActivesAssigned(cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        DesignatedMeter.find({
            include: [
                {
                    relation: 'company'
                },
                {
                    relation: 'meter'
                }
            ],
            where: {
                active: 1
            },
        }, function(err, meters){
            if(err) cb({status: 400, message: "Error al traer los medidores activos"}, null);
            if(meters){
                cb(null, meters);
            }
        });
    };

    Meter.remoteMethod('getActivesAssigned', {
        returns: { arg: 'meters', type: 'object' }
    });

    Meter.getAssigned = function getAssigned(id, cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        DesignatedMeter.find({
            include: [
                {
                    relation: 'company'
                },
                {
                    relation: 'meter'
                }
            ],
            where: {
                and: [
                    { meter_id: id },
                    { active: 1 }
                ]
            },
        }, function(err, meter){
            if(err) cb({status: 400, message: "Error al traer medidor asignado"}, null);
            if(meter){
                cb(null, meter);
            }
        });
    };

    Meter.remoteMethod('getAssigned', {
        accepts: [
            { arg: 'id', type: 'string' }
        ],
        returns: { arg: 'meters', type: 'object' }
    });

    Meter.getDeviceInfo = function getDeviceInfo(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar medidor inactivo"}, null);
                if(meter){
                    EDS.getDeviceInfo(meter, function(err, info){
                        if(err || !info) cb({status:400, message: "Error al consultar medidor, vuelve a intentarlo."});
                        else cb(null, info);
                    });
                }
            });
        }
    };

    Meter.remoteMethod(
        'getDeviceInfo', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'deviceInfo', type: 'object' }
        }
    );

    Meter.deviceVariables = function deviceVariables(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    EDS.getAllDeviceVariables(meter, function(err, info){
                        if(err || !info) cb({status:400, message: "Error al consultar variables, vuelve a intentarlo."});
                        else cb(null, info);
                    });
                }
            });
        }
    };

    Meter.remoteMethod(
        'deviceVariables', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'deviceVars', type: 'object' }
        }
    );

    Meter.getDpReadingsByFilter = function getDpReadingsByFilter(id, device, filter, cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    // Dp values
                    let values = [];
                    var dates = EDS.dateFilterSetup(filter);
                    
                    // Check period of the graph
                    if (filter === Constants.Meters.filters.today || 
                        filter === Constants.Meters.filters.yesterday ||
                        filter === Constants.Meters.filters.week ||
                        filter === Constants.Meters.filters.month) {
                        // Change period of readings to every 15 minutes = 900 seconds
                        dates.period = 900;
                    }

                    let service = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                                    +dates.end+ "?var=" +device+ ".DP?var=" +device+ ".EPimp?period=" +dates.period;
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            let dp = {};
                            if(reading.recordGroup && reading.recordGroup.record){
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    iterable.push(reading.recordGroup.record)
                                } else {
                                    iterable = reading.recordGroup.record;
                                }
                                iterable.map(item => {
                                    dp = {};
                                    dp.value = item.field[0].value._text / 1000;
                                    dp.value = dp.value.toFixed(2);
                                    dp.value = (dp.value < 0)? 0:dp.value;
                                    const day = item.dateTime._text.slice(0,2);
                                    const month = item.dateTime._text.slice(2,4);
                                    const year = item.dateTime._text.slice(4,8);
                                    const hour = item.dateTime._text.slice(8,10);
                                    const minute = item.dateTime._text.slice(10,12);
                                    const second = item.dateTime._text.slice(12,14);
                                    const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                                    let utc_date = moment(tmp_date).tz(timezone);
                                    dp.date = EDS.parseDate(utc_date.format('YYYY-MM-DD HH:mm:ss'));
                                    values.push(dp);
                                });
                                cb(null, values);
                            } else {
                                cb(true, null);
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            cb({status: 400, message:"Error trying to read meter"}, null);
                        }
                    };
                    xhr.send();
                }
            });
        }
    }

    Meter.remoteMethod(
        'getDpReadingsByFilter', {
            accepts: [
                { arg: 'id', type: 'string' },
                { arg: 'device', type: 'string' },
                { arg: 'filter', type: 'number' }
            ],
            returns: { arg: 'values', type: 'array', root: true }
        }
    );

    Meter.getEpimpReadingsByFilter = function getEpimpReadingsByFilter(id, device, filter, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    // Epimp values
                    let values = [];
                    var dates = EDS.dateFilterSetup(filter);

                    let service = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                                    +dates.end+ "?var=" +device+ ".DP?var=" +device+ ".EPimp?period=" +dates.period;
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            let epimp = {};
                            if(reading.recordGroup && reading.recordGroup.record){
                                let iterable = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    iterable.push(reading.recordGroup.record)
                                } else {
                                    iterable = reading.recordGroup.record;
                                }
                                iterable.map(item => {
                                    epimp = {};
                                    const day = item.dateTime._text.slice(0,2);
                                    const month = item.dateTime._text.slice(2,4);
                                    const year = item.dateTime._text.slice(4,8);
                                    const hour = item.dateTime._text.slice(8,10);
                                    const minute = item.dateTime._text.slice(10,12);
                                    const second = item.dateTime._text.slice(12,14);
                                    const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                                    let utc_date = moment(tmp_date).tz(timezone);
                                    epimp.value = item.field[1].value._text;
                                    epimp.value = (epimp.value < 0)? 0:epimp.value;
                                    epimp.date = EDS.parseDate(utc_date.format('YYYY-MM-DD HH:mm:ss'));
                                    values.push(epimp);
                                });
                                cb(null, values);
                            } else {
                                cb(true, null);
                            }
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            cb({status: 400, message:"Error trying to read meter"}, null);
                        }
                    };
                    xhr.send();
                }
            });
        }
    };

    Meter.remoteMethod(
        'getEpimpReadingsByFilter', {
            accepts: [
                { arg: 'id', type: 'string' },
                { arg: 'device', type: 'string' },
                { arg: 'filter', type: 'number' }
            ],
            returns: { arg: 'values', type: 'array', root: true }
        }
    );

    Meter.getConsumptionCostsByFilter = function getConsumptionCostsByFilter(id, device, filter, cb) {
        const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if (!id) cb({ status: 400, message: "Error al obtener la información del medidor" }, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                }
            }, function(err, meter) {
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if (meter) {
                    // TODO: calculate costs 
                    let dates = EDS.dateFilterSetup(filter);
                    // Set period fixed to 1 hour
                    dates.period = 3600;
                    let service = meter.hostname + API_PREFIX + "records.xml" + "?begin=" + dates.begin + "?end=" + dates.end;
                    if (device) {
                        service += "?var=" + device + ".EPimp";
                    } else {
                        meter.devices.map(device => {
                            service += "?var="+device+".EPimp";
                        });
                    }
                    service += "?period=" + dates.period;
                    //console.log("Service to call ", service);
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            const reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            let values = [];
                            if (reading.recordGroup && reading.recordGroup.record) {
                                let records = [];
                                if (!Array.isArray(reading.recordGroup.record)) {
                                    records.push(reading.recordGroup.record)
                                } else {
                                    records = reading.recordGroup.record;
                                }
                                values = records.map(item => {
                                    let read = {};
                                    const day = item.dateTime._text.slice(0,2);
                                    const month = item.dateTime._text.slice(2,4);
                                    const year = item.dateTime._text.slice(4,8);
                                    const hour = item.dateTime._text.slice(8,10);
                                    const minute = item.dateTime._text.slice(10,12);
                                    const second = item.dateTime._text.slice(12,14);
                                    const tmp_date = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second+"Z";
                                    let date = moment(tmp_date).tz(timezone);
                                    
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

                                    let iterable = [];
                                    if (!Array.isArray(item.field)) {
                                        iterable.push(item.field)
                                    } else {
                                        iterable = item.field;
                                    }
                                    let sum = 0;
                                    for (let medition of iterable) {
                                        if (!medition) continue;
                                        sum += parseFloat(medition.value._text);
                                    }
                                    
                                    // Result object
                                    read.date = EDS.parseDate(date.format('YYYY-MM-DD HH:mm:ss'));
                                    read.cost = (sum*rate).toFixed(2);
                                    read.rate = rate_type;
                                    return read;
                                });
                            }
                            cb(null, values);
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            cb({status: 400, message:"Error trying to read meter"}, null);
                        }
                    };
                    xhr.send();
                }
            });
        }
    };

    Meter.remoteMethod(
        'getConsumptionCostsByFilter', {
            accepts: [
                { arg: 'id', type: 'string' },
                { arg: 'device', type: 'string' },
                { arg: 'filter', type: 'number' }
            ],
            returns: { arg: 'costs', type: 'array', root: true }
        }
    );

    Meter.initializer = function initializer(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    cb(null, meter.latestValues);
                }
            });
        }
    };

    Meter.remoteMethod(
        'initializer', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'latestValues', type: 'object' }
        }
    );

    Meter.connectedDevices = function connectedDevices(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    cb(null, meter.devices);
                }
            });
        }
    };

    Meter.remoteMethod(
        'connectedDevices', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'devices', type: 'object', root: true }
        }
    );

    Meter.storeConnectedDevices = function storeConnectedDevices(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al consultar información de medidor'}, null);
        else {
            DesignatedMeter.findOne({
                where: {
                    and: [
                        { id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    let service = meter.hostname+ API_PREFIX +"devices.xml";
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            meter.devices = [];
                            Object.keys(reading.devices.id).forEach(function(key) {
                                meter.devices.push(reading.devices.id[key]._text);
                            });
                            meter.save(function(err, dsgMeter){
                                cb(null, dsgMeter);
                            });
                        } else if (xhr.readyState === 4 && xhr.status !== 200) {
                            cb({status: 400, message:"Error trying to read meter"}, null);
                        }
                    };
                    xhr.send();
                }
            });
        }
    };

    Meter.remoteMethod(
        'storeConnectedDevices', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'devices', type: 'object', root: true }
        }
    );

    Meter.consumptionMaxMinValues = function consumptionMaxMinValues(id, cb){
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');

        if(!id) cb({status: 400, message: 'Error al intentar consultar medidor'}, null);
        else {
            DesignatedMeter.findOne({
                include: [
                    {
                        relation: 'company'
                    },
                    {
                        relation: 'meter'
                    }
                ],
                where: {
                    and: [
                        { meter_id: id },
                        { active: 1 }
                    ]
                },
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error al consultar variables de medidor"}, null);
                if(meter){
                    cb(null, {min: meter.min_value, max: meter.max_value});
                }
            });
        }
    };

    Meter.remoteMethod(
        'consumptionMaxMinValues', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'meter', type: 'object', root: true }
        }
    );

    Meter.updateDesignatedMeter = function updateDesignatedMeter(data, cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        let modelObject = data;
        if(!modelObject || !modelObject.meter_id){
            cb({status: 400, message: "Parametros faltantes"}, null);
        } else {
            DesignatedMeter.findOne({
                where: {
                    and: [
                        { meter_id: modelObject.meter_id },
                        { active: 1 }
                    ]
                }
            }, function(err, meter){
                if(err || !meter) cb({status: 400, message: "Error medidor no encontrado"}, null);
                if(meter){
                    meter.device_name = modelObject.device_name;
                    meter.summatory_device = modelObject.summatory_device,
                    meter.hostname = modelObject.hostname;
                    meter.max_value = parseInt(modelObject.max_value);
                    meter.min_value = parseInt(modelObject.min_value);
                    meter.company_id = modelObject.company_id;
                    meter.updated_at = new Date();
                    meter.save(function(_err, dsgMeter){
                        if(_err) cb({status: 400, message: "Error al guardar los nuevos datos"}, null);
                        else cb(null, dsgMeter);
                    });
                }
            });
        }
    };

    Meter.remoteMethod(
        'updateDesignatedMeter', {
            accepts: [
                { arg: 'data', type: 'object' }
            ],
            returns: { arg: 'response', type: 'object', root: true }
        }
    );
};
