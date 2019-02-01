'use strict'

const moment = require('moment-timezone');
moment.tz.setDefault("America/Mexico_City");

module.exports = function(AdminValue) {


    AdminValue.createOrUpdatePrices = function createOrUpdatePrices(date, payload, cb) {
        let searchDate = moment(date).format();
        if (searchDate === 'Invalid date' ||
            payload.base == null ||
            payload.middle == null ||
            payload.peak == null ||
            payload.capacity == null ||
            payload.distribution == null) {
            cb({ status: 400, message: 'Invalid data' })
        } else {
            AdminValue.findOne(
                {
                    where: {
                        "date": {"gte": new Date(searchDate)}
                    }
                }
            ).then((value) => {
                if (value) {
                    value.basePrice = payload.base;
                    value.middlePrice = payload.middle;
                    value.peakPrice = payload.peak;
                    value.capacityPrice = payload.capacity;
                    value.distributionPrice = payload.distribution;
                    value.save((err, newVal) => {
                        if (err) return cb({ status: 500, message: "Data could not be saved" });
                        cb(null, newVal);
                    });
                } else {
                    AdminValue.create({
                        date: new Date(searchDate),
                        basePrice: payload.base,
                        middlePrice: payload.middle,
                        peakPrice: payload.peak,
                        capacityPrice: payload.capacity,
                        distributionPrice: payload.distribution
                    }).then(() => {
                        cb(null, 'ok');
                    }).catch(err => {
                       console.log(err); 
                    });
                }
            });
        }
    }

    AdminValue.remoteMethod(
        'createOrUpdatePrices', {
            accepts: [
                { arg: 'date', type: 'string' },
                { arg: 'payload', type: 'object' }
            ],
            returns: { arg: 'result', type: 'string' }
        }
    );
}