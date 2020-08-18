"use strict";

const app = require("./../../server/server.js");
const EDS = require("../../server/modules/eds-connector");
const async = require("async");
const API_PREFIX = "/services/user/";
const Converter = require("xml-js");
const moment = require("moment-timezone");
const Constants = require("./../../server/constants.json");
const _l = require("lodash");
const devicesRequests = require("../devicesRequests.js");

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();

const OPTIONS_XML2JS = {
  compact: true,
  spaces: 4,
};
const OPTIONS_JS2XML = {
  indentAttributes: true,
  spaces: 2,
  compact: true,
  fullTagEmptyElement: false,
};

moment.tz.setDefault("America/Mexico_City");
const timezone = "America/Mexico_City";

module.exports = function (Meter) {
  Meter.unassignedMeters = function unassignedMeters(cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");
    Meter.find(
      {
        include: [
          {
            relation: "designatedMeters",
          },
        ],
      },
      function (err, meters) {
        if (err)
          cb({ status: 400, message: "Error al traer los medidores" }, null);
        if (meters) {
          let unassignedMeters = [];
          async.each(
            meters,
            function (meter, next) {
              if (!meter.designatedMeters()[0]) {
                unassignedMeters.push(meter);
              }
              next();
            },
            function () {
              cb(null, unassignedMeters);
            }
          );
        }
      }
    );
  };

  Meter.remoteMethod("unassignedMeters", {
    returns: { arg: "meters", type: "object" },
    http: { path: "/unassignedMeters", verb: "get" },
  });

  Meter.getActivesAssigned = function getActivesAssigned(company_id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");
    DesignatedMeter.find(
      {
        include: [
          {
            relation: "company",
          },
          {
            relation: "meter",
          },
          {
            relation: "services",
          },
        ],
        where: {
          active: 1,
          company_id,
        },
      },
      function (err, meters) {
        if (err)
          cb(
            { status: 400, message: "Error al traer los medidores activos" },
            null
          );
        if (meters) {
          cb(null, meters);
        }
      }
    );
  };

  Meter.remoteMethod("getActivesAssigned", {
    accepts: [
      { arg: "company_id", type: "string", required: false, default: "" },
    ],
    returns: { arg: "meters", type: "object" },
  });

  Meter.getDeviceInfo = function getDeviceInfo(id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              { status: 400, message: "Error al consultar medidor inactivo" },
              null
            );
          if (meter) {
            EDS.getDeviceInfo(meter, function (err, info) {
              if (err || !info)
                cb({
                  status: 400,
                  message: "Error al consultar medidor, vuelve a intentarlo.",
                });
              else cb(null, info);
            });
          }
        }
      );
    }
  };

  Meter.remoteMethod("getDeviceInfo", {
    accepts: [{ arg: "id", type: "string" }],
    returns: { arg: "deviceInfo", type: "object" },
  });

  Meter.deviceVariables = function deviceVariables(id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            EDS.getAllDeviceVariables(meter, function (err, info) {
              if (err || !info)
                cb({
                  status: 400,
                  message: "Error al consultar variables, vuelve a intentarlo.",
                });
              else cb(null, info);
            });
          }
        }
      );
    }
  };

  Meter.remoteMethod("deviceVariables", {
    accepts: [{ arg: "id", type: "string" }],
    returns: { arg: "deviceVars", type: "object" },
  });

  Meter.getNetCodeReadings = function getNetCodeReadings(
    id,
    device,
    filter,
    variables,
    interval,
    custom_dates,
    cb
  ) {
    const DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            let xhr = new XMLHttpRequest();
            let values = {};
            for (const variable of variables) {
              values[variable] = [];
            }

            let dates =
              filter === Constants.Meters.filters.custom
                ? EDS.dateFilterSetup(filter, custom_dates)
                : EDS.dateFilterSetup(filter);

            dates.period = interval;

            let service =
              meter.hostname +
              API_PREFIX +
              "records.xml" +
              "?begin=" +
              dates.begin +
              "?end=" +
              dates.end;
            if (device) {
              for (const variable of variables) {
                service += `?var=${device}.${variable}`;
              }
            } else {
              meter.devices.forEach((device, index) => {
                if (index !== 0) {
                  for (const variable of variables) {
                    service += `?var=${device.name}.${variable}`;
                  }
                }
              });
            }
            service += "?period=" + dates.period;
            // Call the service
            // console.log(`Service to call: ${service}`);
            xhr.open("GET", service);
            setTimeout(() => {
              if (xhr.readyState < 3) {
                xhr.abort();
              }
            }, 4000);

            // Wait for the request to load
            xhr.onload = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                let reading = Converter.xml2js(
                  xhr.responseText,
                  OPTIONS_XML2JS
                );
                if (reading.recordGroup && reading.recordGroup.record) {
                  // Prepare array to iterate over readings
                  let netCode = _l.cloneDeep(values);
                  let iterable = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    iterable.push(reading.recordGroup.record);
                  } else {
                    iterable = reading.recordGroup.record;
                  }
                  iterable.map((item) => {
                    for (const key in netCode) {
                      netCode[key] = {
                        value: 0,
                        date: null,
                      };
                    }
                    let iterable_values = [];
                    if (!Array.isArray(item.field)) {
                      iterable_values.push(item.field);
                    } else {
                      iterable_values = item.field;
                    }
                    iterable_values.forEach((value) => {
                      const current_variable = value.id._text.split(".")[1];
                      netCode[current_variable].value = parseFloat(
                        value.value._text
                      );
                    });
                    const day = item.dateTime._text.slice(0, 2);
                    const month = item.dateTime._text.slice(2, 4);
                    const year = item.dateTime._text.slice(4, 8);
                    const hour = item.dateTime._text.slice(8, 10);
                    const minute = item.dateTime._text.slice(10, 12);
                    const second = item.dateTime._text.slice(12, 14);
                    const tmp_date =
                      year +
                      "-" +
                      month +
                      "-" +
                      day +
                      "T" +
                      hour +
                      ":" +
                      minute +
                      ":" +
                      second +
                      "Z";
                    let utc_date = moment(tmp_date).tz(timezone);

                    for (const key in netCode) {
                      netCode[key].date = EDS.parseDate(
                        utc_date.format("YYYY-MM-DD HH:mm:ss")
                      );
                      if (key === "Ssist")
                        netCode[key].value = netCode[key].value / 1000;
                      netCode[key].value = netCode[key].value.toFixed(2);
                      values[key].push(netCode[key]);
                    }
                  });
                }
                cb(null, values);
              } else if (xhr.readyState === 4 && xhr.status !== 200) {
                cb(
                  { status: 400, message: "Error trying to read meter" },
                  null
                );
              }
            };
            xhr.onerror = function () {
              console.log("Something went wrong on netCodeReadings");
              cb({ status: 504, message: "Meter not reachable" }, null);
            };
            xhr.onabort = function () {
              console.log("netCodeReadings request timed out");
            };
            // Send the request
            xhr.send();
          }
        }
      );
    }
  };

  Meter.remoteMethod("getNetCodeReadings", {
    accepts: [
      { arg: "id", type: "string" },
      { arg: "device", type: "string", required: false, default: "" },
      { arg: "filter", type: "number" },
      { arg: "variables", type: "array" },
      { arg: "interval", type: "number" },
      { arg: "custom_dates", type: "object" },
    ],
    returns: { arg: "values", type: "object", root: true },
  });

  Meter.standardReadings = function standardReadings(
    id,
    device,
    service,
    variable,
    filter,
    interval,
    custom_dates,
    cb
  ) {
    const DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            { relation: "company" },
            { relation: "meter" },
            { relation: "services" },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );

          let values = [];
          const dates =
            filter === Constants.Meters.filters.custom
              ? EDS.dateFilterSetup(filter, custom_dates)
              : EDS.dateFilterSetup(filter);

          if (variable === "DP") {
            dates.period = 900;
          } else {
            dates.period = interval;
          }
          if (meter.tipo == "Acuvim II") {
            //Aqui mover algo
          } else {
            let serviceToCall = `${meter.hostname}${API_PREFIX}records.xml?begin=${dates.begin}?end=${dates.end}`;
            if (service !== "") {
              const selectedService = meter
                .services()
                .filter((serv) => serv.serviceName === service)[0];
              selectedService.devices.forEach((device, index) => {
                if (index !== 0) {
                  serviceToCall += `?var=${device.name}.${variable}`;
                }
              });
            } else {
              serviceToCall += `?var=${device}.${variable}`;
            }
            serviceToCall += `?period=${dates.period}`;

            EDS.performMeterRequest(serviceToCall, 8000)
              .then((reading) => {
                if (reading.recordGroup && reading.recordGroup.record) {
                  let iterable = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    iterable.push(reading.recordGroup.record);
                  } else {
                    iterable = reading.recordGroup.record;
                  }
                  values = iterable.map((item) => {
                    const stdReading = {};
                    let tmp_values = [];
                    if (!Array.isArray(item.field)) {
                      tmp_values.push(item.field);
                    } else {
                      tmp_values = item.field;
                    }
                    stdReading.value = tmp_values.reduce(
                      (accumulator, currentValue) => {
                        return (
                          accumulator + parseFloat(currentValue.value._text)
                        );
                      },
                      0
                    );

                    const day = item.dateTime._text.slice(0, 2);
                    const month = item.dateTime._text.slice(2, 4);
                    const year = item.dateTime._text.slice(4, 8);
                    const hour = item.dateTime._text.slice(8, 10);
                    const minute = item.dateTime._text.slice(10, 12);
                    const second = item.dateTime._text.slice(12, 14);
                    const tmp_date =
                      year +
                      "-" +
                      month +
                      "-" +
                      day +
                      "T" +
                      hour +
                      ":" +
                      minute +
                      ":" +
                      second +
                      "Z";

                    const rate_type = EDS.getCFEGDMTHRateType(tmp_date);

                    if (variable === "DP") {
                      stdReading.value /= 1000;
                      stdReading.isPeak = rate_type === "peak";
                    }

                    stdReading.value = stdReading.value.toFixed(2);
                    stdReading.value =
                      stdReading.value < 0 ? 0 : parseFloat(stdReading.value);

                    let utc_date = moment(tmp_date).tz(timezone);
                    stdReading.date = EDS.parseDate(
                      utc_date.format("YYYY-MM-DD HH:mm:ss")
                    );
                    return stdReading;
                  });
                }

                cb(null, values);
              })
              .catch((error) => {
                cb(error);
              });
          }
        }
      );
    }
  };

  Meter.remoteMethod("standardReadings", {
    accepts: [
      { arg: "id", type: "string" },
      { arg: "device", type: "string" },
      { arg: "service", type: "string" },
      { arg: "variable", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
      { arg: "custom_dates", type: "object" },
    ],
    returns: { arg: "values", type: "array", root: true },
  });

  Meter.getConsumptionCostsByFilter = function getConsumptionCostsByFilter(
    id,
    device,
    service,
    filter,
    interval,
    custom_dates,
    cb
  ) {
    const DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al obtener la información del medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
            {
              relation: "services",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            let xhr = new XMLHttpRequest();

            var dates =
              filter === Constants.Meters.filters.custom
                ? EDS.dateFilterSetup(filter, custom_dates)
                : EDS.dateFilterSetup(filter);
            // Set period fixed to 1 hour
            dates.period = 3600;
            let serviceToCall =
              meter.hostname +
              API_PREFIX +
              "records.xml" +
              "?begin=" +
              dates.begin +
              "?end=" +
              dates.end;
            if (service !== "") {
              const selectedService = meter
                .services()
                .filter((serv) => serv.serviceName === service)[0];
              selectedService.devices.forEach((device, index) => {
                if (index !== 0) {
                  serviceToCall += "?var=" + device.name + ".EPimp";
                }
              });
            } else {
              serviceToCall += "?var=" + device + ".EPimp";
            }
            serviceToCall += "?period=" + dates.period;
            xhr.open("GET", serviceToCall);
            setTimeout(() => {
              if (xhr.readyState < 3) {
                xhr.abort();
              }
            }, 8000);
            xhr.onload = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                const reading = Converter.xml2js(
                  xhr.responseText,
                  OPTIONS_XML2JS
                );
                let bandera = false;
                let values = [];
                if (reading.recordGroup && reading.recordGroup.record) {
                  let records = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    records.push(reading.recordGroup.record);
                  } else {
                    records = reading.recordGroup.record;
                  }
                  // Remembers the previous day
                  let prevDay = null;
                  let prevDate = null;
                  // Keeps track of the costs per day
                  let dailyCosts = 0;
                  // Keeps track of each cost per day
                  let rateCosts = {
                    base: 0,
                    middle: 0,
                    peak: 0,
                  };
                  // Saves values grouped by day interval
                  let dailyValues = [];

                  let tariff_type = meter.company().tariff_type;

                  async.eachSeries(
                    records,
                    async (item) => {
                      let read = {};
                      const day = item.dateTime._text.slice(0, 2);
                      const month = item.dateTime._text.slice(2, 4);
                      const year = item.dateTime._text.slice(4, 8);
                      const hour = item.dateTime._text.slice(8, 10);
                      const minute = item.dateTime._text.slice(10, 12);
                      const second = item.dateTime._text.slice(12, 14);
                      const tmp_date =
                        year +
                        "-" +
                        month +
                        "-" +
                        day +
                        "T" +
                        hour +
                        ":" +
                        minute +
                        ":" +
                        second +
                        "Z";
                      let date = moment.parseZone(tmp_date).tz(timezone);
                      let CFE_rates = await EDS.getCFERate(
                        tmp_date,
                        meter.company().Division,
                        tariff_type
                      );
                      const rate = CFE_rates.rate;
                      const rate_type = CFE_rates.rate_type;
                      let iterable = [];
                      if (!Array.isArray(item.field)) {
                        iterable.push(item.field);
                      } else {
                        iterable = item.field;
                      }
                      let sum = 0;
                      for (let medition of iterable) {
                        if (!medition) continue;
                        sum += parseFloat(medition.value._text);
                      }
                      // If interval is per day
                      if (interval === 1) {
                        if (prevDay !== date.dayOfYear()) {
                          if (prevDay != null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.cost = dailyCosts;
                            read.rate = "diario";
                            if (tariff_type === "GDMTH") {
                              rateCosts.base = rateCosts.base.toFixed(2);
                              rateCosts.middle = rateCosts.middle.toFixed(2);
                              rateCosts.peak = rateCosts.peak.toFixed(2);
                            }
                            read.rateCosts = rateCosts;
                            console.log(read);
                            dailyValues.push(read);
                          }
                          prevDate = date;
                          prevDay = date.dayOfYear();
                          dailyCosts = 0;
                          if (tariff_type === "GDMTH") {
                            rateCosts = {
                              base: 0,
                              middle: 0,
                              peak: 0,
                            };
                          } else if (tariff_type === "GDMTO") {
                            rateCosts = {
                              ordinary: 0,
                            };
                          }
                        }
                        dailyCosts += sum * rate;
                        rateCosts[rate_type] += sum * rate;
                        Promise.resolve();
                      } else {
                        // Result object
                        read.date = EDS.parseDate(
                          date.format("YYYY-MM-DD HH:mm:ss")
                        );
                        read.cost = sum * rate;
                        read.consumption = sum;
                        read.rate = rate_type;
                        // Aqui se empieza a comparar
                        if (meter.max_value < read.cost) {
                          bandera = true;
                        }
                        values.push(read);
                        Promise.resolve();
                      }
                    },
                    (err) => {
                      if (err) return cb(err, null);
                      if (interval === 1) {
                        if (prevDay != null) {
                          let read = {};
                          read.date = EDS.parseDate(
                            prevDate.format("YYYY-MM-DD HH:mm:ss")
                          );
                          read.cost = dailyCosts;
                          read.rate = "diario";
                          if (tariff_type === "GDMTH") {
                            rateCosts.base = rateCosts.base.toFixed(2);
                            rateCosts.middle = rateCosts.middle.toFixed(2);
                            rateCosts.peak = rateCosts.peak.toFixed(2);
                          }
                          read.rateCosts = rateCosts;
                          dailyValues.push(read);
                        }
                        // If interval is daily, replace values with dailyValues
                        cb(null, dailyValues);
                      } else {
                        const notificaciones = app.loopback.getModel(
                          "notificaciones"
                        );
                        const User = app.loopback.getModel("eUser");
                        if (bandera) {
                          console.log(bandera);
                          User.find({
                            where: {
                              company_id: meter.company_id,
                            },
                          }).then((users) => {
                            var Fecha = Date.now();
                            notificaciones.create(
                              [
                                {
                                  Dispositivos: [
                                    "!Cuidado! Algunas variables están por encima de lo permitido por el Código de Red ",
                                  ],
                                  Servicios: [
                                    "Algunas variables están por encima de lo permitido por el Código de Red.",
                                  ],
                                  company_id: meter.company_id,
                                  tipo: "Código de Red",
                                  intervalo: "Error",
                                  Descripcion:
                                    "!Cuidado! Algunas variables están por encima de lo permitido por el Código de Red. ",
                                  En_Correo: false,
                                  Fecha: Fecha,
                                  usuarios: users,
                                },
                              ],
                              function () {
                                console.log(
                                  "Creando notificacion Error de codigo de red "
                                );
                              }
                            ); //Creando notificacion
                          });
                        }
                        cb(null, values);
                      }
                    }
                  );
                } else {
                  return cb(null, values);
                }
              } else if (xhr.readyState === 4 && xhr.status !== 200) {
                cb(
                  { status: 400, message: "Error trying to read meter" },
                  null
                );
              }
            };
            xhr.onerror = function () {
              console.log("Something went wrong on costs");
              cb({ status: 504, message: "Meter not reachable" }, null);
            };
            xhr.onabort = function () {
              console.log("costs request timed out");
            };
            xhr.send();
          }
        }
      );
    }
  };

  Meter.remoteMethod("getConsumptionCostsByFilter", {
    accepts: [
      { arg: "id", type: "string" },
      { arg: "device", type: "string" },
      { arg: "service", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
      { arg: "custom_dates", type: "object" },
    ],
    returns: { arg: "costs", type: "array", root: true },
  });

  Meter.generationReadings = function generationReadings(
    id,
    device,
    service,
    filter,
    interval,
    variable,
    custom_dates,
    cb
  ) {
    const Services = app.loopback.getModel("Service");
    const DesignatedMeter = app.loopback.getModel("DesignatedMeter");
    let dR = new devicesRequests();

    DesignatedMeter.findOne({
      include: [
        {
          relation: "company",
        },
        {
          relation: "meter",
        },
        {
          relation: "services",
        },
      ],
      where: {
        and: [{ meter_id: id }, { active: 1 }],
      },
    })
      .then((meter) => {
        if (!meter)
          return cb(
            { status: 400, message: "Error while consulting meter variables" },
            null
          );

        new Promise((resolve, reject) => {
          if (service !== undefined) {
            Services.find({
              where: {
                designatedMeterId: meter.id,
                serviceName: service,
              },
            }).then((res) => {
              if (res === undefined || res.length === 0) {
                return reject(
                  "There's not a service with " +
                    id +
                    " id and " +
                    res +
                    " name"
                );
              }
              service = res[0];
              return resolve(service.devices);
            });
          } else if (device !== undefined) {
            let foundDevice = meter.devices.find((tmpDevice) => {
              return tmpDevice.name === device;
            });
            if (foundDevice === undefined) {
              return reject(
                "There's not a device with " +
                  id +
                  " id and " +
                  device +
                  " name"
              );
            }
            return resolve([foundDevice]);
          } else {
            return reject("There's not a service or device in the request");
          }
        }).then((devices) => {
          var dates =
            filter === Constants.Meters.filters.custom
              ? EDS.dateFilterSetup(filter, custom_dates)
              : EDS.dateFilterSetup(filter);
          // Set period fixed to 1 hour
          dates.period = 3600;

          let EPgenDevices = [];
          if (
            meter["generationDevices"] !== undefined ||
            meter.generationDevices.length !== 0
          ) {
            let meterEPgenDevices = new Set(meter.generationDevices);
            let tmpDevices = devices;
            devices = [];

            tmpDevices.forEach((device) => {
              if (meterEPgenDevices.has(device.name)) {
                EPgenDevices.push(device);
              } else {
                devices.push(device);
              }
            });
          }
          //variable
          // 0 - generation, 1 - selfConsumption, 2 - networkInjection
          Promise.all([
            //generation
            new Promise((resolve, reject) => {
              if (variable !== 0 && variable !== 1) return resolve();
              dR.getData(meter.hostname, dates, API_PREFIX, EPgenDevices, [
                "EPgen",
              ]).then((reading) => {
                if (
                  reading &&
                  reading.recordGroup &&
                  reading.recordGroup.record
                ) {
                  let records = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    records.push(reading.recordGroup.record);
                  } else {
                    records = reading.recordGroup.record;
                  }
                  let prevPeriod = null;
                  let prevDate = null;
                  //stores the values per period
                  let values = [];
                  let periodValue = 0;
                  async.eachSeries(
                    records,
                    async (item) => {
                      let read = {};
                      const day = item.dateTime._text.slice(0, 2);
                      const month = item.dateTime._text.slice(2, 4);
                      const year = item.dateTime._text.slice(4, 8);
                      const hour = item.dateTime._text.slice(8, 10);
                      const minute = item.dateTime._text.slice(10, 12);
                      const second = item.dateTime._text.slice(12, 14);
                      const tmp_date =
                        year +
                        "-" +
                        month +
                        "-" +
                        day +
                        "T" +
                        hour +
                        ":" +
                        minute +
                        ":" +
                        second +
                        "Z";
                      let date = moment.parseZone(tmp_date).tz(timezone);

                      let iterable = [];
                      if (!Array.isArray(item.field)) {
                        iterable.push(item.field);
                      } else {
                        iterable = item.field;
                      }
                      let summatory = 0;
                      for (let medition of iterable) {
                        if (!medition) continue;
                        summatory += parseFloat(medition.value._text);
                      }
                      //per day
                      if (interval === 1) {
                        if (prevPeriod !== date.dayOfYear()) {
                          if (prevPeriod !== null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.value = periodValue.toFixed(2);
                            values.push(read);
                          }
                          prevDate = date;
                          prevPeriod = date.dayOfYear();
                          periodValue = 0;
                        }
                        periodValue += summatory;
                        Promise.resolve();
                      } else if (interval === 2) {
                        //per month
                        if (prevPeriod !== date.month()) {
                          if (prevPeriod != null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.value = periodValue.toFixed(2);
                            values.push(read);
                          }
                          prevDate = date;
                          prevPeriod = date.month();
                          periodValue = 0;
                        }
                        periodValue += summatory;
                        Promise.resolve();
                      } else {
                        //per hour
                        read.date = EDS.parseDate(
                          date.format("YYYY-MM-DD HH:mm:ss")
                        );
                        read.value = summatory;
                        values.push(read);
                        Promise.resolve();
                      }
                    },
                    (err) => {
                      if (err) return cb(err, null);
                      if (interval === 1 || interval === 2) {
                        if (prevPeriod != null) {
                          let read = {};
                          read.date = EDS.parseDate(
                            prevDate.format("YYYY-MM-DD HH:mm:ss")
                          );
                          read.value = periodValue.toFixed(2);
                          values.push(read);
                        }
                      }
                      resolve(values);
                    }
                  );
                } else {
                  resolve([]);
                }
              });
            }),
            //networkInjection
            new Promise((resolve, reject) => {
              if (variable !== 2 && variable !== 1) return resolve();
              dR.getData(meter.hostname, dates, API_PREFIX, devices, [
                "EPexp",
              ]).then((reading) => {
                if (
                  reading &&
                  reading.recordGroup &&
                  reading.recordGroup &&
                  reading.recordGroup.record
                ) {
                  let records = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    records.push(reading.recordGroup.record);
                  } else {
                    records = reading.recordGroup.record;
                  }
                  let prevPeriod = null;
                  let prevDate = null;
                  //stores the values per period
                  let values = [];
                  let periodValue = 0;
                  async.eachSeries(
                    records,
                    async (item) => {
                      let read = {};
                      const day = item.dateTime._text.slice(0, 2);
                      const month = item.dateTime._text.slice(2, 4);
                      const year = item.dateTime._text.slice(4, 8);
                      const hour = item.dateTime._text.slice(8, 10);
                      const minute = item.dateTime._text.slice(10, 12);
                      const second = item.dateTime._text.slice(12, 14);
                      const tmp_date =
                        year +
                        "-" +
                        month +
                        "-" +
                        day +
                        "T" +
                        hour +
                        ":" +
                        minute +
                        ":" +
                        second +
                        "Z";
                      let date = moment.parseZone(tmp_date).tz(timezone);

                      let iterable = [];
                      if (!Array.isArray(item.field)) {
                        iterable.push(item.field);
                      } else {
                        iterable = item.field;
                      }
                      let summatory = 0;
                      for (let medition of iterable) {
                        if (!medition) continue;
                        summatory += parseFloat(medition.value._text);
                      }
                      //per day
                      if (interval === 1) {
                        if (prevPeriod !== date.dayOfYear()) {
                          if (prevPeriod !== null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.value = periodValue.toFixed(2);
                            values.push(read);
                          }
                          prevDate = date;
                          prevPeriod = date.dayOfYear();
                          periodValue = 0;
                        }
                        periodValue += summatory;
                        Promise.resolve();
                      } else if (interval === 2) {
                        //per month
                        if (prevPeriod !== date.month()) {
                          if (prevPeriod != null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.value = periodValue.toFixed(2);
                            values.push(read);
                          }
                          prevDate = date;
                          prevPeriod = date.month();
                          periodValue = 0;
                        }
                        periodValue += summatory;
                        Promise.resolve();
                      } else {
                        //per hour
                        read.date = EDS.parseDate(
                          date.format("YYYY-MM-DD HH:mm:ss")
                        );
                        read.value = summatory;
                        values.push(read);
                        Promise.resolve();
                      }
                    },
                    (err) => {
                      if (err) return cb(err, null);
                      if (interval === 1 || interval === 2) {
                        if (prevPeriod != null) {
                          let read = {};
                          read.date = EDS.parseDate(
                            prevDate.format("YYYY-MM-DD HH:mm:ss")
                          );
                          read.value = periodValue.toFixed(2);
                          values.push(read);
                        }
                      }
                      resolve(values);
                    }
                  );
                } else {
                  resolve([]);
                }
              });
            }),
          ])
            .then((res) => {
              if (variable === 0) {
                return cb(null, res[0]);
              } else if (variable === 1) {
                let selfConsumptionArr = [];
                let auxValue;
                res[1].forEach((item, i) => {
                  if (res[0][i] !== undefined) {
                    auxValue = res[0][i].value - item.value;
                  } else {
                    auxValue = 0 - item.value;
                  }
                  selfConsumptionArr.push({ date: item.date, value: auxValue });
                });
                return cb(null, selfConsumptionArr);
              } else if (variable === 2) {
                return cb(null, res[1]);
              }
            })
            .catch((err) => {
              console.log(err);
              return cb(err, null);
            });
        });
      })
      .catch((err) => {
        cb(err, null);
      });
  };

  Meter.remoteMethod("generationReadings", {
    accepts: [
      { arg: "id", type: "string" },
      { arg: "device", type: "string" },
      { arg: "service", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
      { arg: "variable", type: "number" },
      { arg: "custom_dates", type: "object" },
    ],
    returns: { arg: "generationReadings", type: "array", root: true },
  });

  Meter.co2e = function co2e(
    id,
    device,
    service,
    filter,
    interval,
    custom_dates,
    cb
  ) {
    const emissionFactor = Constants.CFE.values.emission_factor;
    const DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al obtener la información del medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
            {
              relation: "services",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            let xhr = new XMLHttpRequest();

            var dates =
              filter === Constants.Meters.filters.custom
                ? EDS.dateFilterSetup(filter, custom_dates)
                : EDS.dateFilterSetup(filter);
            // Set period fixed to 1 hour
            dates.period = 3600;
            let serviceToCall =
              meter.hostname +
              API_PREFIX +
              "records.xml" +
              "?begin=" +
              dates.begin +
              "?end=" +
              dates.end;
            if (service !== "") {
              const selectedService = meter
                .services()
                .filter((serv) => serv.serviceName === service)[0];
              selectedService.devices.forEach((device, index) => {
                if (index !== 0) {
                  serviceToCall += "?var=" + device.name + ".EPimp";
                }
              });
            } else {
              serviceToCall += "?var=" + device + ".EPimp";
            }
            serviceToCall += "?period=" + dates.period;
            //console.log(serviceToCall);
            xhr.open("GET", serviceToCall);
            setTimeout(() => {
              if (xhr.readyState < 3) {
                xhr.abort();
              }
            }, 120000);
            xhr.onload = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                const reading = Converter.xml2js(
                  xhr.responseText,
                  OPTIONS_XML2JS
                );
                let values = [];
                if (reading.recordGroup && reading.recordGroup.record) {
                  let records = [];
                  if (!Array.isArray(reading.recordGroup.record)) {
                    records.push(reading.recordGroup.record);
                  } else {
                    records = reading.recordGroup.record;
                  }
                  let prevMonth = null;
                  // Remembers the previous day
                  let prevDay = null;
                  let prevDate = null;
                  // Keeps track of co2e per day
                  let dailyCo2e = 0;
                  let monthlyCo2e = 0;
                  // Saves values grouped by day interval
                  let dailyValues = [];
                  let monthlyValues = [];
                  async.eachSeries(
                    records,
                    async (item) => {
                      let read = {};
                      const day = item.dateTime._text.slice(0, 2);
                      const month = item.dateTime._text.slice(2, 4);
                      const year = item.dateTime._text.slice(4, 8);
                      const hour = item.dateTime._text.slice(8, 10);
                      const minute = item.dateTime._text.slice(10, 12);
                      const second = item.dateTime._text.slice(12, 14);
                      const tmp_date =
                        year +
                        "-" +
                        month +
                        "-" +
                        day +
                        "T" +
                        hour +
                        ":" +
                        minute +
                        ":" +
                        second +
                        "Z";
                      let date = moment.parseZone(tmp_date).tz(timezone);

                      let iterable = [];
                      if (!Array.isArray(item.field)) {
                        iterable.push(item.field);
                      } else {
                        iterable = item.field;
                      }
                      let sum = 0;
                      for (let medition of iterable) {
                        if (!medition) continue;
                        sum += parseFloat(medition.value._text);
                      }
                      // If interval is per day
                      if (interval === 1) {
                        if (prevDay !== date.dayOfYear()) {
                          if (prevDay != null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.co2e = dailyCo2e.toFixed(2);
                            dailyValues.push(read);
                          }
                          prevDate = date;
                          prevDay = date.dayOfYear();
                          dailyCo2e = 0;
                        }
                        dailyCo2e += emissionFactor * (sum / 1000);
                        Promise.resolve();
                      } else if (interval === 2) {
                        //if interval is per month
                        if (prevMonth !== date.month()) {
                          if (prevMonth != null) {
                            read.date = EDS.parseDate(
                              prevDate.format("YYYY-MM-DD HH:mm:ss")
                            );
                            read.co2e = monthlyCo2e.toFixed(2);
                            monthlyValues.push(read);
                          }
                          prevDate = date;
                          prevMonth = date.month();
                          monthlyCo2e = 0;
                        }
                        monthlyCo2e += emissionFactor * (sum / 1000);
                        Promise.resolve();
                      } else {
                        // Result object
                        read.date = EDS.parseDate(
                          date.format("YYYY-MM-DD HH:mm:ss")
                        );
                        read.co2e = emissionFactor * (sum / 1000);
                        values.push(read);
                        Promise.resolve();
                      }
                    },
                    (err) => {
                      if (err) return cb(err, null);
                      if (interval === 1) {
                        if (prevDay != null) {
                          let read = {};
                          read.date = EDS.parseDate(
                            prevDate.format("YYYY-MM-DD HH:mm:ss")
                          );
                          read.co2e = dailyCo2e.toFixed(2);
                          dailyValues.push(read);
                        }
                        // If interval is daily, replace values with dailyValues
                        cb(null, dailyValues);
                      } else if (interval == 2) {
                        if (prevMonth != null) {
                          let read = {};
                          read.date = EDS.parseDate(
                            prevDate.format("YYYY-MM-DD HH:mm:ss")
                          );
                          read.co2e = monthlyCo2e.toFixed(2);
                          monthlyValues.push(read);
                        }
                        // If interval is daily, replace values with dailyValues
                        cb(null, monthlyValues);
                      } else {
                        cb(null, values);
                      }
                    }
                  );
                } else {
                  return cb(null, values);
                }
              } else if (xhr.readyState === 4 && xhr.status !== 200) {
                cb(
                  { status: 400, message: "Error trying to read meter" },
                  null
                );
              }
            };
            xhr.onerror = function () {
              console.log("Something went wrong on costs");
              cb({ status: 504, message: "Meter not reachable" }, null);
            };
            xhr.onabort = function () {
              console.log("costs request timed out");
            };
            xhr.send();
          }
        }
      );
    }
  };

  Meter.remoteMethod("co2e", {
    accepts: [
      { arg: "id", type: "string" },
      { arg: "device", type: "string" },
      { arg: "service", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
      { arg: "custom_dates", type: "object" },
    ],
    returns: { arg: "co2e", type: "array", root: true },
  });

  Meter.connectedDevices = function connectedDevices(id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
          ],
          where: {
            and: [{ id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            cb(null, meter.devices);
          }
        }
      );
    }
  };

  Meter.remoteMethod("connectedDevices", {
    accepts: [{ arg: "id", type: "string" }],
    returns: { arg: "devices", type: "object", root: true },
  });

  Meter.storeConnectedDevices = function storeConnectedDevices(id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb(
        { status: 400, message: "Error al consultar información de medidor" },
        null
      );
    else {
      DesignatedMeter.findOne(
        {
          where: {
            and: [{ id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            let service = meter.hostname + API_PREFIX + "devices.xml";
            xhr.open("GET", service);
            setTimeout(() => {
              if (xhr.readyState < 3) {
                xhr.abort();
              }
            }, 4000);
            xhr.onload = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                var reading = Converter.xml2js(
                  xhr.responseText,
                  OPTIONS_XML2JS
                );
                meter.devices = [];
                Object.keys(reading.devices.id).forEach(function (key) {
                  meter.devices.push(reading.devices.id[key]._text);
                });
                meter.save(function (err, dsgMeter) {
                  DesignatedMeter.setDeviceDescriptions(
                    meter.id,
                    (err, res) => {
                      if (err) return cb(err, null);
                      cb(null, dsgMeter);
                    }
                  );
                });
              } else if (xhr.readyState === 4 && xhr.status !== 200) {
                cb(
                  { status: 400, message: "Error trying to read meter" },
                  null
                );
              }
            };
            xhr.onerror = function () {
              cb({ status: 504, message: "Meter not reachable" }, null);
            };
            xhr.onabort = function () {
              console.log("costs request timed out");
            };
            xhr.send();
          }
        }
      );
    }
  };

  Meter.remoteMethod("storeConnectedDevices", {
    accepts: [{ arg: "id", type: "string" }],
    returns: { arg: "devices", type: "object", root: true },
  });

  Meter.consumptionMaxMinValues = function consumptionMaxMinValues(id, cb) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");

    if (!id)
      cb({ status: 400, message: "Error al intentar consultar medidor" }, null);
    else {
      DesignatedMeter.findOne(
        {
          include: [
            {
              relation: "company",
            },
            {
              relation: "meter",
            },
          ],
          where: {
            and: [{ meter_id: id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb(
              {
                status: 400,
                message: "Error al consultar variables de medidor",
              },
              null
            );
          if (meter) {
            cb(null, { min: meter.min_value, max: meter.max_value });
          }
        }
      );
    }
  };

  Meter.remoteMethod("consumptionMaxMinValues", {
    accepts: [{ arg: "id", type: "string" }],
    returns: { arg: "meter", type: "object", root: true },
  });

  Meter.updateDesignatedMeter = function updateDesignatedMeter(
    meter,
    services,
    generation,
    cb
  ) {
    var DesignatedMeter = app.loopback.getModel("DesignatedMeter");
    let modelObject = meter;
    if (!modelObject || !modelObject.meter_id) {
      cb({ status: 400, message: "Parametros faltantes" });
    } else {
      DesignatedMeter.findOne(
        {
          include: ["services"],
          where: {
            and: [{ meter_id: modelObject.meter_id }, { active: 1 }],
          },
        },
        function (err, meter) {
          if (err || !meter)
            cb({ status: 400, message: "Error medidor no encontrado" });
          const meterServices = meter.services();
          meter.unsetAttribute("services");
          if (meter) {
            meter.device_name = modelObject.device_name;
            (meter.summatory_device = modelObject.summatory_device),
              (meter.hostname = modelObject.hostname);
            meter.max_value = parseInt(modelObject.max_value);
            meter.min_value = parseInt(modelObject.min_value);
            meter.company_id = modelObject.company_id;
            meter.updated_at = new Date();
            meter.generationDevices = generation;
            meter.save(function (_err, dsgMeter) {
              if (_err)
                return cb({
                  status: 400,
                  message: "Error al guardar los nuevos datos",
                });
              async.mapSeries(
                meterServices,
                (serv, next) => {
                  serv.devices = meter.devices.filter(
                    (device, index) =>
                      index === 0 ||
                      services[serv.serviceName].includes(device.name)
                  );
                  serv.save((err, updated) => {
                    if (err) next(err);
                    else next(null, updated);
                  });
                },
                (err, updatedServices) => {
                  if (err)
                    return cb({
                      status: 400,
                      message: "Error al guardar los servicios",
                    });
                  cb(null, updatedServices);
                }
              );
            });
          }
        }
      );
    }
  };

  Meter.remoteMethod("updateDesignatedMeter", {
    accepts: [
      { arg: "meter", type: "object" },
      { arg: "services", type: "object" },
      { arg: "generation", type: "array" },
    ],
    returns: { arg: "response", type: "object", root: true },
  });
};
