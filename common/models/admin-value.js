'use strict'

const Constants = require('../../server/constants.json');
const moment = require('moment-timezone');
moment.tz.setDefault("America/Mexico_City");

module.exports = function(AdminValue) {

    AdminValue.findByDate = function findByDate(date, cb) {
        let searchDate = moment(date).format();
        let endDate = moment(searchDate).add(1, 'day').format();
        if (searchDate === 'Invalid date') {
            cb({ status: 400, message: 'Invalid date' })
        } else {
            AdminValue.findOne(
                {
                    where: {
                        and: [
                            {"date": {"gte": new Date(searchDate)}},
                            {"date": {"lt": new Date(endDate)}}
                        ]
                    }
                }
            ).then(value => {
                if (value) {
                    cb(null, value);
                } else {
                    const result = {
                        basePrice: Constants.CFE.values.consumption_price.base,
                        middlePrice: Constants.CFE.values.consumption_price.middle,
                        peakPrice: Constants.CFE.values.consumption_price.peak,
                        capacityPrice: Constants.CFE.values.capacity_price,
                        distributionPrice: Constants.CFE.values.distribution_price
                    }
                    cb(null, result);
                }
            });
        }
    }

    AdminValue.remoteMethod(
        'findByDate', {
            accepts: [
                { arg: 'date', type: 'string' }
            ],
            returns: { arg: 'cfeValue', type: 'object' }
        }
    )


    AdminValue.createOrUpdatePrices = function createOrUpdatePrices(date, payload, cb) {
        let searchDate = moment(date).format();
        let endDate = moment(searchDate).add(1, 'day').format();
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
                        and: [
                            {"date": {"gte": new Date(searchDate)}},
                            {"date": {"lt": new Date(endDate)}}
                        ]
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
                    let obj = {
                        date: new Date(searchDate),
                        basePrice: payload.base,
                        middlePrice: payload.middle,
                        peakPrice: payload.peak,
                        capacityPrice: payload.capacity,
                        distributionPrice: payload.distribution
                    };
                    AdminValue.create(obj).then(() => {
                        cb(null, obj);
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
            returns: { arg: 'cfeValue', type: 'object' }
        }
    );
}