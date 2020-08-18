"use strict";
const moment = require("moment-timezone");
const designatedMeter = require("./designated-meter");
moment.tz.setDefault("America/Mazatlan");
const app = require("../../server/server.js");
const meter = require("./meter");
const Company = app.loopback.getModel("Company");

module.exports = function (Minutes) {
  Minutes.VariablesMedidorUltimaHora = function (Dia, DesignatedMeterId, cb) {
    Minutes.find({
      where: {
        Dia: Dia,
        DesignatedMeterId: DesignatedMeterId,
      },
    }).then((TodosLosRegistros) => {
      if (TodosLosRegistros[0] == undefined) {
        cb(null, {
          error: "No se encontraron registros con el dia y el id del medidor",
        });
      } else {
        var Ultimo_registro = TodosLosRegistros.pop();
        var elements = [];
        var horas = [];
        var probando = Ultimo_registro.toObject();
        var x = Object.values(probando);
        var Variables_Diarios = {
          V12: 0,
          V23: 0,
          V31: 0,
          I1: 0,
          I2: 0,
          I3: 0,
          Ssum_KVA: 0,
          PF1: 0,
          PF2: 0,
          PF3: 0,
          EP_IMP_kWh: 0,
          EP_EXP_kWh: 0,
          DMD_P_kW: 0,
          Unbl_U: 0,
          Unbl_I: 0,
          THD_Ia: 0,
          THD_Ib: 0,
          THD_Ic: 0,
        };
        for (let i = 3; i < x.length; i++) {
          Variables_Diarios.V12 = Variables_Diarios.V12 + x[i].V12;
          Variables_Diarios.V23 = Variables_Diarios.V23 + x[i].V23;
          Variables_Diarios.V31 = Variables_Diarios.V31 + x[i].V31;
          Variables_Diarios.I1 = Variables_Diarios.I1 + x[i].I1;
          Variables_Diarios.I2 = Variables_Diarios.I2 + x[i].I2;
          Variables_Diarios.I3 = Variables_Diarios.I3 + x[i].I3;
          Variables_Diarios.Ssum_KVA =
            Variables_Diarios.Ssum_KVA + x[i].Ssum_KVA;
          Variables_Diarios.PF1 = Variables_Diarios.PF1 + x[i].PF1;
          Variables_Diarios.PF2 = Variables_Diarios.PF2 + x[i].PF2;
          Variables_Diarios.PF3 = Variables_Diarios.PF3 + x[i].PF3;
          Variables_Diarios.EP_IMP_kWh =
            Variables_Diarios.EP_IMP_kWh + x[i].EP_IMP_kWh;
          Variables_Diarios.EP_EXP_kWh =
            Variables_Diarios.EP_EXP_kWh + x[i].EP_EXP_kWh;
          Variables_Diarios.DMD_P_kW =
            Variables_Diarios.DMD_P_kW + x[i].DMD_P_kW;
          Variables_Diarios.Unbl_U = Variables_Diarios.Unbl_U + x[i].Unbl_U;
          Variables_Diarios.Unbl_I = Variables_Diarios.Unbl_I + x[i].Unbl_I;
          Variables_Diarios.THD_Ia = Variables_Diarios.THD_Ia + x[i].THD_Ia;
          Variables_Diarios.THD_Ib = Variables_Diarios.THD_Ib + x[i].THD_Ib;
          Variables_Diarios.THD_Ic = Variables_Diarios.THD_Ic + x[i].THD_Ic;
        }

        for (var i in Ultimo_registro) {
          elements.push(Ultimo_registro[i]);
          horas.push(i);
        }
        Variables_Diarios.ultima_modificacion = horas[horas.length - 31];
        cb(null, Variables_Diarios);
      }
    });
  };

  Minutes.remoteMethod("VariablesMedidorUltimaHora", {
    accepts: [
      {
        arg: "Dia",
        type: "string",
      },
      { arg: "DesignatedMeterId", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.BaseMediaPuntaDia = function (
    Dia,
    DesignatedMeterId,
    id_empresa,
    cb
  ) {
    Minutes.find({
      where: {
        Dia: Dia,
        DesignatedMeterId: DesignatedMeterId,
      },
    }).then((TodosLosRegistros) => {
      if (TodosLosRegistros[0] == undefined) {
        cb(null, {
          error: "No se encontraron registros con el dia y el id del medidor",
        });
      } else {
        Company.findOne({ where: { id: id_empresa } }).then((company) => {
          let startOfMonth = moment().startOf("month");
          let date = moment(startOfMonth).tz("America/Mexico_City");
          let new_date = date.clone().startOf("month").format();
          let AdminValue = app.loopback.getModel("AdminValue");
          AdminValue.findByDate(new_date, company.Division, (err, res) => {
            var sumatoria_Costo = 0;
            if (company.tariff_type == "GDMTH") {
              // todo falta para otras tarifas
              let base = res.GDMTH.basePrice;
              let intermedio = res.GDMTH.middlePrice;
              let punta = res.GDMTH.peakPrice;

              var date = moment();
              var hoy = date.day();
              var contador = 0;
              var valores = TodosLosRegistros[0].toObject();
              for (var i in valores) {
                if (contador > 2) {
                  // es una hora
                  var horas = i.split(":");
                  // console.log("hora", horas[0]);

                  if (hoy < 5) {
                    // LUNES A VIERNES

                    if (horas[0] <= 5) {
                      // de 00:00 a 5:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 6 && horas[0] <= 19) {
                      // de 06:00 a 19:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 20 && horas[0] <= 21) {
                      // de 20:00 a 21:59
                      //console.log("Punta");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * punta;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }

                    if (horas[0] >= 22 && horas[0] <= 24) {
                      // de 22:00 a 23:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                  if (hoy == 6) {
                    // SABADOOOOOOOOO
                    if (horas[0] <= 6) {
                      // de 00:00 a 6:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 7 && horas[0] <= 24) {
                      // de 07:00 a 19:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                  if (hoy == 7) {
                    // Domingo
                    if (horas[0] <= 18) {
                      // de 00:00 a 18:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 19 && horas[0] <= 24) {
                      // de 07:00 a 19:59
                      // console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                }
                contador = contador + 1;
              }
              sumatoria_Costo = sumatoria_Costo.toFixed(2);

              cb(null, sumatoria_Costo);
            } //acaba tarifa GDMTH
          });
        });
      }
    });
  };

  Minutes.remoteMethod("BaseMediaPuntaDia", {
    accepts: [
      {
        arg: "Dia",
        type: "string",
      },
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "id_empresa", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.BaseMediaPuntaMes = function (DesignatedMeterId, id_empresa, cb) {
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    }).then((TodosLosRegistros) => {
      if (TodosLosRegistros[0] == undefined) {
        cb(null, {
          error: "No se encontraron registros con el id del medidor",
        });
      } else {
        var arreglocostos = [];
        var Dia = moment().format("L");
        var fecha = Dia.split("/");
        var mes = fecha[1];
        var año = fecha[2];
        for (let i = 0; i < TodosLosRegistros.length; i++) {
          const Minutess = app.loopback.getModel("Minutes");
          var fecha2 = TodosLosRegistros[i].Dia.split("/");
          var diaelemento = fecha2[0];
          var meselemento = fecha2[1];
          var añoelemento = fecha2[2];
          //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
          var fechadelelemento =
            añoelemento + "-" + meselemento + "-" + diaelemento;

          var inicioMes = año + "-" + mes + "-01";
          var finalmes = año + "-" + mes;
          var end =
            moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
          //   console.log( TodosLosRegistros[i].Dia, moment(fechadelelemento).isBetween(inicioMes, end) );
          if (moment(fechadelelemento).isBetween(inicioMes, end)) {
            console.log(TodosLosRegistros[i].Dia);

            Minutess.BaseMediaPuntaDia(
              TodosLosRegistros[i].Dia,
              DesignatedMeterId,
              id_empresa,
              function (err, valoresDiarios) {
                var valor = parseInt(valoresDiarios);
                arreglocostos.push(valor);
              }
            );
          }
        }
        setTimeout(function () {
          var sum = 0;
          for (var i in arreglocostos) {
            sum += arreglocostos[i];
          }

          cb(null, sum);
        }, 1000);
      }
    });
  };

  Minutes.remoteMethod("BaseMediaPuntaMes", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "id_empresa", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.VariablesMensual = function (DesignatedMeterId, cb) {
    var variablesMensuales = {
      V12: 0,
      V23: 0,
      V31: 0,
      I1: 0,
      I2: 0,
      I3: 0,
      Ssum_KVA: 0,
      PF1: 0,
      PF2: 0,
      PF3: 0,
      EP_IMP_kWh: 0,
      EP_EXP_kWh: 0,
      DMD_P_kW: 0,
      Unbl_U: 0,
      Unbl_I: 0,
      THD_Ia: 0,
      THD_Ib: 0,
      THD_Ic: 0,
    };
    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    }).then((TodosLosRegistros) => {
      for (let i = 0; i < TodosLosRegistros.length; i++) {
        const Minutess = app.loopback.getModel("Minutes");
        var fecha2 = TodosLosRegistros[i].Dia.split("/");
        var diaelemento = fecha2[0];
        var meselemento = fecha2[1];
        var añoelemento = fecha2[2];
        //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
        var fechadelelemento =
          añoelemento + "-" + meselemento + "-" + diaelemento;

        var inicioMes = año + "-" + mes + "-01";
        var finalmes = año + "-" + mes;
        var end = moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
        console.log(
          TodosLosRegistros[i].Dia,
          moment(fechadelelemento).isBetween(inicioMes, end)
        );
        if (moment(fechadelelemento).isBetween(inicioMes, end)) {
          Minutess.VariablesMedidorUltimaHora(
            TodosLosRegistros[i].Dia,
            DesignatedMeterId,
            function (err, valoresDiarios) {
              variablesMensuales.V12 =
                variablesMensuales.V12 + valoresDiarios.V12;
              variablesMensuales.V23 =
                variablesMensuales.V23 + valoresDiarios.V23;
              variablesMensuales.V31 =
                variablesMensuales.V31 + valoresDiarios.V31;
              variablesMensuales.I1 = variablesMensuales.I1 + valoresDiarios.I1;
              variablesMensuales.I2 = variablesMensuales.I2 + valoresDiarios.I2;
              variablesMensuales.I3 = variablesMensuales.I3 + valoresDiarios.I3;
              variablesMensuales.Ssum_KVA =
                variablesMensuales.Ssum_KVA + valoresDiarios.Ssum_KVA;
              variablesMensuales.PF1 =
                variablesMensuales.PF1 + valoresDiarios.PF1;
              variablesMensuales.PF2 =
                variablesMensuales.PF2 + valoresDiarios.PF2;
              variablesMensuales.PF3 =
                variablesMensuales.PF3 + valoresDiarios.PF3;
              variablesMensuales.EP_IMP_kWh =
                variablesMensuales.EP_IMP_kWh + valoresDiarios.EP_IMP_kWh;
              variablesMensuales.EP_EXP_kWh =
                variablesMensuales.EP_EXP_kWh + valoresDiarios.EP_EXP_kWh;
              variablesMensuales.DMD_P_kW =
                variablesMensuales.DMD_P_kW + valoresDiarios.DMD_P_kW;
              variablesMensuales.Unbl_U =
                variablesMensuales.Unbl_U + valoresDiarios.Unbl_U;
              variablesMensuales.Unbl_I =
                variablesMensuales.Unbl_I + valoresDiarios.Unbl_I;
              variablesMensuales.THD_Ia =
                variablesMensuales.THD_Ia + valoresDiarios.THD_Ia;
              variablesMensuales.THD_Ib =
                variablesMensuales.THD_Ib + valoresDiarios.THD_Ib;
              variablesMensuales.THD_Ic =
                variablesMensuales.THD_Ic + valoresDiarios.THD_Ic;
            }
          );
        }
      }

      setTimeout(function () {
        cb(null, variablesMensuales);
      }, 1000);
    });
  };

  Minutes.remoteMethod("VariablesMensual", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.EpimpHistorialMensualActual = function (DesignatedMeterId, cb) {
    var respuesta = [];
    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    }).then((TodosLosRegistros) => {
      for (let i = 0; i < TodosLosRegistros.length; i++) {
        const Minutess = app.loopback.getModel("Minutes");
        var fecha2 = TodosLosRegistros[i].Dia.split("/");
        var diaelemento = fecha2[0];
        var meselemento = fecha2[1];
        var añoelemento = fecha2[2];
        //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
        var fechadelelemento =
          añoelemento + "-" + meselemento + "-" + diaelemento;

        var inicioMes = año + "-" + mes + "-01";
        var finalmes = año + "-" + mes;
        var end = moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
        console.log(
          TodosLosRegistros[i].Dia,
          moment(fechadelelemento).isBetween(inicioMes, end)
        );
        if (moment(fechadelelemento).isBetween(inicioMes, end)) {
          Minutess.VariablesMedidorUltimaHora(
            TodosLosRegistros[i].Dia,
            DesignatedMeterId,
            function (err, valoresDiarios) {
              console.log(valoresDiarios.EP_IMP_kWh, TodosLosRegistros[i].Dia);
              respuesta.push({
                date: TodosLosRegistros[i].Dia,
                value: valoresDiarios.EP_IMP_kWh,
              });
            }
          );
        }
      }

      setTimeout(function () {
        cb(null, respuesta);
      }, 1000);
    });
  };

  Minutes.remoteMethod("EpimpHistorialMensualActual", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.Demanda = function (DesignatedMeterId, periodo, id_empresa, cb) {
    console.log(DesignatedMeterId, periodo, id_empresa);
    DesignatedMeterId = "idMedidor";
    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    })
      .then((TodosLosRegistros) => {
        var demandas = [];
        var epimpMensual = 0;
        for (let i = 0; i < TodosLosRegistros.length; i++) {
          const Minutess = app.loopback.getModel("Minutes");
          var fecha2 = TodosLosRegistros[i].Dia.split("/");
          var diaelemento = fecha2[0];
          var meselemento = fecha2[1];
          var añoelemento = fecha2[2];
          //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
          var fechadelelemento =
            añoelemento + "-" + meselemento + "-" + diaelemento;

          var inicioMes = año + "-" + mes + "-01";
          var finalmes = año + "-" + mes;
          var end =
            moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
          //   console.log( TodosLosRegistros[i].Dia, moment(fechadelelemento).isBetween(inicioMes, end) );
          if (moment(fechadelelemento).isBetween(inicioMes, end)) {
            Minutess.VariablesMedidorUltimaHora(
              TodosLosRegistros[i].Dia,
              DesignatedMeterId,
              function (err, valoresDiarios) {
                demandas.push(valoresDiarios.DMD_P_kW);
                epimpMensual = epimpMensual + valoresDiarios.EP_IMP_kWh;
              }
            );
          }
        }
        setTimeout(function () {
          demandas = Math.max(...demandas);
          console.log(
            "Maximo de demanda mensual",
            demandas,
            "con epimp recaudado del mes",
            epimpMensual
          );
          Company.findOne({ where: { id: id_empresa } }).then((company) => {
            console.log(company.tariff_type);

            if (company.tariff_type == "GDMTH") {
              var fc = 0.57;

              if (periodo == 3) {
                console.log("las horas son:", moment().hours());
                console.log("dias que han pasado:", moment().date());

                var resultado =
                  epimpMensual / (moment().hours() * moment().date() * fc);
                cb(null, resultado);
              }
            }
          });
        }, 400);

        //TODO        Agregar que se valide GDMTH con la empresa y la union
      })
      .catch((err) => {
        console.log(err);
      });
  };

  Minutes.remoteMethod("Demanda", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "periodo", type: "number" },
      { arg: "id_empresa", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.Dibs = function (DesignatedMeterId, periodo, id_empresa, cb) {
    console.log(DesignatedMeterId, periodo, id_empresa);
    DesignatedMeterId = "idMedidor";
    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    })
      .then((TodosLosRegistros) => {
        var demandas = [];
        var epimpMensual = 0;
        for (let i = 0; i < TodosLosRegistros.length; i++) {
          const Minutess = app.loopback.getModel("Minutes");
          var fecha2 = TodosLosRegistros[i].Dia.split("/");
          var diaelemento = fecha2[0];
          var meselemento = fecha2[1];
          var añoelemento = fecha2[2];
          //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
          var fechadelelemento =
            añoelemento + "-" + meselemento + "-" + diaelemento;

          var inicioMes = año + "-" + mes + "-01";
          var finalmes = año + "-" + mes;
          var end =
            moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
          //   console.log( TodosLosRegistros[i].Dia, moment(fechadelelemento).isBetween(inicioMes, end) );
          if (moment(fechadelelemento).isBetween(inicioMes, end)) {
            Minutess.VariablesMedidorUltimaHora(
              TodosLosRegistros[i].Dia,
              DesignatedMeterId,
              function (err, valoresDiarios) {
                demandas.push(valoresDiarios.DMD_P_kW);
                epimpMensual = epimpMensual + valoresDiarios.EP_IMP_kWh;
              }
            );
          }
        }
        setTimeout(function () {
          demandas = Math.max(...demandas);
          console.log(
            "Maximo de demanda mensual",
            demandas,
            "con epimp recaudado del mes",
            epimpMensual
          );
          Company.findOne({ where: { id: id_empresa } }).then((company) => {
            console.log(company.tariff_type);
            console.log(company.Division);
            let startOfMonth = moment().startOf("month");

            let date = moment(startOfMonth).tz("America/Mexico_City");
            let new_date = date.clone().startOf("month").format();
            let AdminValue = app.loopback.getModel("AdminValue");
            AdminValue.findByDate(new_date, company.Division, (err, res) => {
              console.log(res.GDMTH.distributionPrice);
              if (company.tariff_type == "GDMTH") {
                var fc = 0.57; //

                if (periodo == 3) {
                  console.log("las horas son:", moment().hours());
                  console.log("dias que han pasado:", moment().date());

                  var resultado = {};
                  resultado.value =
                    epimpMensual / (moment().hours() * moment().date() * fc);
                  resultado.cost =
                    resultado.value * res.GDMTH.distributionPrice;

                  cb(null, resultado);
                }
              }
            });
          });
        }, 600);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  Minutes.remoteMethod("Dibs", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "periodo", type: "number" },
      { arg: "id_empresa", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.DistributionPeriod = function (
    DesignatedMeterId,
    periodo,
    id_empresa,
    cb
  ) {
    console.log(DesignatedMeterId, periodo, id_empresa);
    DesignatedMeterId = "idMedidor";
    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    Minutes.find({
      where: {
        DesignatedMeterId: DesignatedMeterId,
      },
    })
      .then((TodosLosRegistros) => {
        var demandas = [];
        var epimpMensual = 0;
        for (let i = 0; i < TodosLosRegistros.length; i++) {
          const Minutess = app.loopback.getModel("Minutes");
          var fecha2 = TodosLosRegistros[i].Dia.split("/");
          var diaelemento = fecha2[0];
          var meselemento = fecha2[1];
          var añoelemento = fecha2[2];
          //         console.log(moment().format("L"), moment("2020-08-06")); para ver los formatos
          var fechadelelemento =
            añoelemento + "-" + meselemento + "-" + diaelemento;

          var inicioMes = año + "-" + mes + "-01";
          var finalmes = año + "-" + mes;
          var end =
            moment(finalmes).format("YYYY-MM-") + moment().daysInMonth();
          //   console.log( TodosLosRegistros[i].Dia, moment(fechadelelemento).isBetween(inicioMes, end) );
          if (moment(fechadelelemento).isBetween(inicioMes, end)) {
            Minutess.VariablesMedidorUltimaHora(
              TodosLosRegistros[i].Dia,
              DesignatedMeterId,
              function (err, valoresDiarios) {
                demandas.push(valoresDiarios.DMD_P_kW);
                epimpMensual = epimpMensual + valoresDiarios.EP_IMP_kWh;
              }
            );
          }
        }
        setTimeout(function () {
          demandas = Math.max(...demandas);
          console.log(
            "Maximo de demanda mensual",
            demandas,
            "con epimp recaudado del mes",
            epimpMensual
          );
          Company.findOne({ where: { id: id_empresa } }).then((company) => {
            console.log(company.tariff_type);
            console.log(company.Division);
            let startOfMonth = moment().startOf("month");

            let date = moment(startOfMonth).tz("America/Mexico_City");
            let new_date = date.clone().startOf("month").format();
            let AdminValue = app.loopback.getModel("AdminValue");
            AdminValue.findByDate(new_date, company.Division, (err, res) => {
              console.log(res.GDMTH.distributionPrice);
              if (company.tariff_type == "GDMTH") {
                var fc = 0.57; //

                if (periodo == 3) {
                  console.log("las horas son:", moment().hours());
                  console.log("dias que han pasado:", moment().date());

                  var resultado = {};
                  resultado.value =
                    epimpMensual / (moment().hours() * moment().date() * fc);
                  resultado.cost =
                    resultado.value * res.GDMTH.distributionPrice;

                  resultado.value = resultado.value.toFixed(2);
                  resultado.cost = resultado.cost.toFixed(2);

                  cb(null, resultado);
                }
              }
            });
          });
        }, 600);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  Minutes.remoteMethod("DistributionPeriod", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "periodo", type: "number" },
      { arg: "id_empresa", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });
};
