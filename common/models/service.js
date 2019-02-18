const app = require('./../../server/server.js');
const Constants = require('./../../server/constants.json');
const _l = require('lodash');

module.exports = function(Service) {

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