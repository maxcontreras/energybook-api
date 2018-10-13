'use strict';

const app = require('./../../server/server.js');
const EDS = require('../../server/modules/eds-connector');
const async = require('async');
const API_PREFIX = "/services/user/";
const Converter = require('xml-js');

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

    Meter.getReadingsByFilter = function getReadingsByFilter(id, filter, cb){
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
                    let values = {};
                    values.dp = [];
                    values.epimp = [];
                    var dates = EDS.dateFilterSetup(filter);

                    let service = meter.hostname+ API_PREFIX +"records.xml" + "?begin=" +dates.begin+ "?end="
                                    +dates.end+ "?var=" +meter.device_name+ ".DP?var=" +meter.device_name+ ".EPimp?period=" +dates.period;
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            let read = {};
                            Object.keys(reading.recordGroup.record).forEach(function(key) {
                                read.dp = {};
                                read.epimp = {};
                                read.dp.value = reading.recordGroup.record[key].field[0].value._text;
                                read.dp.date = reading.recordGroup.record[key].dateTime._text;
                                read.epimp.value = reading.recordGroup.record[key].field[1].value._text;
                                read.epimp.date = reading.recordGroup.record[key].dateTime._text;
                                values.dp.push(read.dp);
                                values.epimp.push(read.epimp);
                            });
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
        'getReadingsByFilter', {
            accepts: [
                { arg: 'id', type: 'string' },
                { arg: 'filter', type: 'number' }
            ],
            returns: { arg: 'values', type: 'object', root: true }
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
                    let service = meter.hostname+ API_PREFIX +"devices.xml";
                    xhr.open('GET', service, false);
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var reading = Converter.xml2js(xhr.responseText, OPTIONS_XML2JS);
                            var connectedDevices = [];
                            Object.keys(reading.devices.id).forEach(function(key) {
                                connectedDevices.push(reading.devices.id[key]._text);
                            });
                            cb(null, connectedDevices);
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
        'connectedDevices', {
            accepts: [
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'devices', type: 'object', root: true }
        }
    );
};
