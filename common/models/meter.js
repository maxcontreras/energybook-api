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
                                    const day = parseInt(item.dateTime._text.slice(0,2));
                                    const month = parseInt(item.dateTime._text.slice(2,4))-1;
                                    const year = parseInt(item.dateTime._text.slice(4,8));
                                    const hour = parseInt(item.dateTime._text.slice(8,10));
                                    const minute = parseInt(item.dateTime._text.slice(10,12));
                                    const second = parseInt(item.dateTime._text.slice(12,14));
                                    const milliseconds = parseInt(item.dateTime._text.slice(14));
                                    let utc_date = new Date(year, month, day, hour, minute, second, milliseconds);
                                    utc_date = new Date(utc_date-new Date(2.16e7)).toISOString();
                                    dp.date = EDS.parseDate(moment(utc_date).tz(timezone).format('YYYY-MM-DD HH:mm:ss'));
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
                                    const day = parseInt(item.dateTime._text.slice(0,2));
                                    const month = parseInt(item.dateTime._text.slice(2,4))-1;
                                    const year = parseInt(item.dateTime._text.slice(4,8));
                                    const hour = parseInt(item.dateTime._text.slice(8,10));
                                    const minute = parseInt(item.dateTime._text.slice(10,12));
                                    const second = parseInt(item.dateTime._text.slice(12,14));
                                    const milliseconds = parseInt(item.dateTime._text.slice(14));
                                    let utc_date = new Date(year, month, day, hour, minute, second, milliseconds);
                                    utc_date = new Date(utc_date-new Date(2.16e7)).toISOString();
                                    epimp.value = item.field[1].value._text;
                                    epimp.value = (epimp.value < 0)? 0:epimp.value;
                                    epimp.date = EDS.parseDate(moment(utc_date).tz(timezone).format('YYYY-MM-DD HH:mm:ss'));
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
