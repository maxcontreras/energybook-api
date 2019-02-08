'use strict';

const app = require('./../../server/server.js');
const async = require('async');
const Constants = require('./../../server/constants.json');

module.exports = function(Company) {
    Company.register = function register(data, cb){
        let new_company = data.data;

        Company.create({
            company_name: new_company.company_name,
            phone: new_company.phone,
            company_type: new_company.type_id,
            size: new_company.size,
            status: Constants.Companies.status.Nuevo,
            created_at: new Date(),
            updated_at: new Date()
        }, function(err, company){
            if(err) cb(err, null)
            if(company){
                company.users.create({
                    name: new_company.name,
                    lastname: new_company.lastname,
                    phone: new_company.phone,
                    email: new_company.email,
                    password: new_company.password,
                    role_id: Constants.Eusers.roles.Cliente,
                    created_at: new Date(),
                    updated_at: new Date()
                }, function(err, user){
                    if(err) cb(err, null)
                    if(user){
                        cb(null, true);
                    }
                });
            }
        });
    };

    Company.remoteMethod(
        'register', {
            accepts: [
                { arg: 'data', type: 'object' }
            ],
            returns: { arg: 'response', type: 'boolean' }
        }
    );

    Company.designateMeter = function designateMeter(data, cb) {
        var DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        var Meters = app.loopback.getModel('Meter');
        let modelObject = data;
        if(!modelObject || !modelObject.company_id || !modelObject.meter_id){
            cb({status: 400, message: "Parametros faltantes"}, null);
        } else {
            DesignatedMeter.create({
                device_name: modelObject.device_name,
                summatory_device: Constants.Meters.common_names.summatory_device,
                hostname: modelObject.hostname,
                max_value: parseInt(modelObject.max_value),
                min_value: parseInt(modelObject.min_value),
                latestValues: {},
                active: 1,
                meter_id: modelObject.meter_id,
                company_id: modelObject.company_id,
                created_at: new Date()
            }, function (err, designatedMeter){
                if(err) cb({status: 400, message: "Error al asignar medidor"}, null);
                else {
                    Meters.storeConnectedDevices(designateMeter.meter_id, (err, met) => {
                        if (err) return cb(err, null);
                        cb(null, 'Medidor '+ designatedMeter.meter_id +' asignado correctamente');
                    });
                }
            });
        }
    };

    Company.remoteMethod(
        'designateMeter', {
            accepts: [
                { arg: 'data', type: 'object' }
            ],
            returns: { arg: 'response', type: 'object', root: true }
        }
    );

    Company.block = function block(company_id, cb) {
        if(!company_id){
            cb({status: 400, message: "ID de compañía faltante"}, null);
        } else {
            Company.findById(company_id, function(err, company){
                company.status = Constants.Companies.status.Bloqueada;
                company.save(function(err, updated_company){
                    updated_company.users(function(err, users){
                        async.each(users, function (user, next){
                            user.status = Constants.Eusers.status.Bloqueado;
                            user.save();
                            next();
                        }, function(err){
                            cb(null, 'Compañía bloqueada exitosamente');
                        });
                    });
                });
            });
        }
    };

    Company.remoteMethod(
        'block', {
            accepts: [
                { arg: 'company_id', type: 'string' }
            ],
            returns: { arg: 'response', type: 'string', root: true }
        }
    );

    Company.addUsers = function addUsers(data, cb) {
        if(!data.company.id){
            cb({status: 400, message: "ID de compañía faltante"}, null);
        } else {
            Company.findById(data.company.id, function(err, company){
                if(!company || company.status === Constants.Companies.status.Bloqueada){
                    cb({status: 400, message: "Error, compañía bloqueada"}, null);
                } else {
                    company.users.create({
                        name: data.manager.name,
                        lastname: data.manager.lastname,
                        phone: data.company.phone,
                        email: data.manager.email,
                        password: 'Energybook',
                        created_at: new Date(),
                        updated_at: new Date()
                    }, function(err, user){
                        if(err) cb(err, null)

                    });
                    if(data.user){
                        company.users.create({
                            name: data.user.name,
                            lastname: data.user.lastname,
                            phone: data.company.phone,
                            email: data.user.email,
                            password: 'Energybook',
                            created_at: new Date(),
                            updated_at: new Date()
                        }, function(err, user){
                            if(err) cb(err, null)
                        });
                    }
                    cb(null, true);
                }
            });
        }
    };

    Company.remoteMethod(
        'addUsers', {
            accepts: [
                { arg: 'data', type: 'object' }
            ],
            returns: { arg: 'response', type: 'string', root: true }
        }
    );

    Company.updateData = function updateData(data, cb) {
        let new_company = data.company;
        if(!new_company.id){
            cb({status: 400, message: "ID de compañía faltante"}, null);
        } else {
            Company.findById(new_company.id, function(err, company){
                if(err){
                    cb({status: 400, message: err}, null);
                } else {
                    company.company_name = new_company.company_name;
                    company.legal_name = new_company.company_name;
                    company.phone = new_company.phone;
                    company.company_type = new_company.type_id;
                    company.location = new_company.location;
                    company.save(function(err, savedCompany){

                    });
                    cb(null, true);
                }
            });
        }
    };

    Company.remoteMethod(
        'updateData', {
            accepts: [
                { arg: 'data', type: 'object' }
            ],
            returns: { arg: 'response', type: 'string', root: true }
        }
    );
};
