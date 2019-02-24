const app = require('./../../server/server.js');
const Constants = require('./../../server/constants.json');
const moment = require('moment-timezone');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
const READINGS = require('../../server/modules/eds-readings');
const _l = require('lodash');

module.exports = function(Service) {

    Service.monthlyHistory = function monthlyHistory(service, companyId, period, cb) {
        DesignatedMeter.findOne({
            include: [
                {
                    relation: 'services'
                }
            ],
            where: {
                and: [
                    {company_id: companyId}
                ]
            }
        }, (err, meter) => {
            if (err) return cb({status: 404, message: 'Meter not found'}, null);
            let startDate = moment(period).startOf('month').format();
            let endDate = moment(period).endOf('month').format();
            if (startDate === 'Invalid date' || endDate === 'Invalid date') {
                return cb({status: 404, message: 'Period is invalid'}, null);
            }
            const services = meter.services();
            if (services) {
                const custom_dates = {from: startDate, until: endDate};
                const userService = services.filter(serv => serv.serviceName === service)[0];
                READINGS.monthlyReadings(meter, userService, true, custom_dates, (err, readings) => {
                    if (err) return cb(err, null);
                    READINGS.fpReadings(meter, userService, true, custom_dates, (err, fpReadings) => {
                        if (err) return cb(err, null);
                        if (fpReadings) {
                            readings.fp = fpReadings.fp;
                        }
                        cb(null, readings);
                    });
                    
                });
            } else {
                cb({status: 404, message: 'No services related to current meter'}, null);
            }
        });
    }

    Service.remoteMethod(
        'monthlyHistory', {
            accepts: [
                {arg: 'service', type: 'string'},
                {arg: 'companyId', type: 'string'},
                {arg: 'period', type: 'string'}
            ],
            returns: {arg: 'data', type: 'object'}
        }
    )

    Service.setUpBasicService = function setUpBasicService(cb) {
        const DesignatedMeter = app.loopback.getModel('DesignatedMeter');
        DesignatedMeter.find({
                include: ['services']
            })
            .then(meters => {
                meters.forEach(meter => {
                    let services = meter.services();
                    if (services.length === 0) {
                        const devices = _l.cloneDeep(meter.devices);
                        const serviceName = 'Servicio 1';
                        meter.services.create({
                            devices,
                            serviceName
                        }, (err, service) => {
                            if (err) return console.log(err);
                            console.log('Service created succesfully!')
                        });
                    }
                });
                cb(null, 'OK');
            });
    }

    Service.remoteMethod(
        'setUpBasicService', {
            accepts: [],
            returns: {arg: 'result', type: 'string'}
        }
    )
};