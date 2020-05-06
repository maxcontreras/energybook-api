"use strict";

const Constants = require("../../server/constants.json");
const moment = require("moment-timezone");
moment.tz.setDefault("America/Mexico_City");

module.exports = function (AdminValue) {
  AdminValue.findByDate = function findByDate(date, division, cb) {
    let searchDate = moment(date).format();
    let endDate = moment(searchDate).add(1, "day").format();
    if (searchDate === "Invalid date" || division === "") {
      cb({ status: 400, message: "Invalid date or division" });
    } else {
      AdminValue.findOne({
        where: {
          and: [
            { date: { gte: new Date(searchDate) } },
            { date: { lt: new Date(endDate) } },
            { Division: division },
          ],
        },
      }).then((value) => {
        if (value) {
          if (
            value["GDMTH"] === undefined ||
            value["GDMTH"] === null ||
            Object.keys(value["GDMTH"]).length === 0
          ) {
            value["GDMTH"] = {};
            value.GDMTH.basePrice = Constants.CFE.values.consumption_price.base;
            value.GDMTH.middlePrice =
              Constants.CFE.values.consumption_price.middle;
            value.GDMTH.peakPrice = Constants.CFE.values.consumption_price.peak;
            value.GDMTH.capacityPrice = Constants.CFE.values.capacity_price;
            value.GDMTH.distributionPrice =
              Constants.CFE.values.distribution_price;
          }
          if (
            value["GDMTO"] === undefined ||
            value["GDMTO"] === null ||
            Object.keys(value["GDMTO"]).length === 0
          ) {
            value["GDMTO"] = {};
            value.GDMTO.ordinaryPrice =
              Constants.CFE.values.GDMTO.prices.ordinary;
            value.GDMTO.capacityPrice =
              Constants.CFE.values.GDMTO.prices.capacity;
            value.GDMTO.distributionPrice =
              Constants.CFE.values.GDMTO.prices.distribution;
          }
          return cb(null, value);
        } else {
          const result = {
            GDMTH: {
              basePrice: Constants.CFE.values.consumption_price.base,
              middlePrice: Constants.CFE.values.consumption_price.middle,
              peakPrice: Constants.CFE.values.consumption_price.peak,
              capacityPrice: Constants.CFE.values.capacity_price,
              distributionPrice: Constants.CFE.values.distribution_price,
            },
            GDMTO: {
              ordinaryPrice: Constants.CFE.values.GDMTO.prices.ordinary,
              capacityPrice: Constants.CFE.values.GDMTO.prices.capacity,
              distributionPrice: Constants.CFE.values.GDMTO.prices.distribution,
            },
          };
          return cb(null, result);
        }
      });
    }
  };

  AdminValue.remoteMethod("findByDate", {
    accepts: [
      { arg: "date", type: "string" },
      { arg: "division", type: "string" },
    ],
    returns: { arg: "cfeValue", type: "object" },
  });

  AdminValue.createOrUpdatePrices = function createOrUpdatePrices(
    date,
    city,
    payload,
    tariffType,
    cb
  ) {
    let searchDate = moment(date).format();
    let endDate = moment(searchDate).add(1, "day").format();
    if (
      ((tariffType === "GDMTH" || tariffType === "GDMTO") &&
        tariffType === "GDMTH" &&
        (searchDate === "Invalid date" ||
          payload.base == null ||
          payload.middle == null ||
          payload.peak == null ||
          payload.capacity == null ||
          payload.distribution == null)) ||
      (tariffType === "GDMTO" && payload.ordinary == null) ||
      payload.capacity == null ||
      payload.distribution == null
    ) {
      cb({ status: 400, message: "Invalid data" });
    } else {
      AdminValue.findOne({
        where: {
          and: [
            { date: { gte: new Date(searchDate) } },
            { date: { lt: new Date(endDate) } },
            { Division: city },
          ],
        },
      }).then((value) => {
        if (value) {
          if (value[tariffType] === undefined) {
            value[tariffType] = {};
          }
          if (tariffType === "GDMTH") {
            value[tariffType].basePrice = payload.base;
            value[tariffType].middlePrice = payload.middle;
            value[tariffType].peakPrice = payload.peak;
          } else if (tariffType === "GDMTO") {
            value[tariffType].ordinaryPrice = parseFloat(payload.ordinary);
          }
          value[tariffType].capacityPrice = parseFloat(payload.capacity);
          value[tariffType].distributionPrice = parseFloat(
            payload.distribution
          );

          value.save((err, newVal) => {
            if (err)
              return cb({
                status: 500,
                message: "CFE data could not be saved",
              });
            //fills data with constants if there's not a saved value in the db
            if (
              newVal["GDMTH"] === undefined ||
              newVal["GDMTH"] === null ||
              Object.keys(newVal["GDMTH"]).length === 0
            ) {
              newVal["GDMTH"] = {};
              newVal.GDMTH.basePrice =
                Constants.CFE.values.consumption_price.base;
              newVal.GDMTH.middlePrice =
                Constants.CFE.values.consumption_price.middle;
              newVal.GDMTH.peakPrice =
                Constants.CFE.values.consumption_price.peak;
              newVal.GDMTH.capacityPrice = Constants.CFE.values.capacity_price;
              newVal.GDMTH.distributionPrice =
                Constants.CFE.values.distribution_price;
            }
            if (
              newVal["GDMTO"] === undefined ||
              newVal["GDMTO"] === null ||
              Object.keys(newVal["GDMTO"]).length === 0
            ) {
              newVal["GDMTO"] = {};
              newVal.GDMTO.ordinaryPrice =
                Constants.CFE.values.GDMTO.prices.ordinary;
              newVal.GDMTO.capacityPrice =
                Constants.CFE.values.GDMTO.prices.capacity;
              newVal.GDMTO.distributionPrice =
                Constants.CFE.values.GDMTO.prices.distribution;
            }
            cb(null, newVal);
          });
        } else {
          let obj = {
            date: new Date(searchDate),
            Division: city,
            GDMTH: {},
            GDMTO: {},
          };

          if (tariffType === "GDMTH") {
            obj[tariffType].basePrice = payload.base;
            obj[tariffType].middlePrice = payload.middle;
            obj[tariffType].peakPrice = payload.peak;
          } else if (tariffType === "GDMTO") {
            obj[tariffType].ordinaryPrice = payload.ordinary;
          }

          obj[tariffType].capacityPrice = payload.capacity;
          obj[tariffType].distributionPrice = payload.distribution;

          AdminValue.create(obj)
            .then(() => {
              if (
                obj["GDMTH"] === undefined ||
                obj["GDMTH"] === null ||
                Object.keys(obj["GDMTH"]).length === 0
              ) {
                obj["GDMTH"] = {};
                obj.GDMTH.basePrice =
                  Constants.CFE.values.consumption_price.base;
                obj.GDMTH.middlePrice =
                  Constants.CFE.values.consumption_price.middle;
                obj.GDMTH.peakPrice =
                  Constants.CFE.values.consumption_price.peak;
                obj.GDMTH.capacityPrice = Constants.CFE.values.capacity_price;
                obj.GDMTH.distributionPrice =
                  Constants.CFE.values.distribution_price;
              }
              if (
                obj["GDMTO"] === undefined ||
                obj["GDMTO"] === null ||
                Object.keys(obj["GDMTO"]).length === 0
              ) {
                obj["GDMTO"] = {};
                obj.GDMTO.ordinaryPrice =
                  Constants.CFE.values.GDMTO.prices.ordinary;
                obj.GDMTO.capacityPrice =
                  Constants.CFE.values.GDMTO.prices.capacity;
                obj.GDMTO.distributionPrice =
                  Constants.CFE.values.GDMTO.prices.distribution;
              }
              cb(null, obj);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    }
  };

  AdminValue.remoteMethod("createOrUpdatePrices", {
    accepts: [
      { arg: "date", type: "string" },
      { arg: "city", type: "string" },
      { arg: "payload", type: "object" },
      { arg: "tariffType", type: "string" },
    ],
    returns: { arg: "cfeValue", type: "object" },
  });
};
