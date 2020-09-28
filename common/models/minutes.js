"use strict";
const moment = require("moment-timezone");
const designatedMeter = require("./designated-meter");
moment.tz.setDefault("America/Mazatlan");
const app = require("../../server/server.js");
const meter = require("./meter");
const { parse } = require("mustache");
const Company = app.loopback.getModel("Company");
const DesignatedMeter = app.loopback.getModel("DesignatedMeter");
const Constants = require("./../../server/constants.json");
const horas = [
  "00:05",
  "00:10",
  "00:15",
  "00:20",
  "00:25",
  "00:30",
  "00:35",
  "00:40",
  "00:45",
  "00:50",
  "00:55",
  "01:00",
  "01:05",
  "01:10",
  "01:15",
  "01:20",
  "01:25",
  "01:30",
  "01:35",
  "01:40",
  "01:45",
  "01:50",
  "01:55",
  "02:00",
  "02:05",
  "02:10",
  "02:15",
  "02:20",
  "02:25",
  "02:30",
  "02:35",
  "02:40",
  "02:45",
  "02:50",
  "02:55",
  "03:00",
  "03:05",
  "03:10",
  "03:15",
  "03:20",
  "03:25",
  "03:30",
  "03:35",
  "03:40",
  "03:45",
  "03:50",
  "03:55",
  "04:00",
  "04:05",
  "04:10",
  "04:15",
  "04:20",
  "04:25",
  "04:30",
  "04:35",
  "04:40",
  "04:45",
  "04:50",
  "04:55",
  "05:00",
  "05:05",
  "05:10",
  "05:15",
  "05:20",
  "05:25",
  "05:30",
  "05:35",
  "05:40",
  "05:45",
  "05:50",
  "05:55",
  "06:00",
  "06:05",
  "06:10",
  "06:15",
  "06:20",
  "06:25",
  "06:30",
  "06:35",
  "06:40",
  "06:45",
  "06:50",
  "06:55",
  "07:00",
  "07:05",
  "07:10",
  "07:15",
  "07:20",
  "07:25",
  "07:30",
  "07:35",
  "07:40",
  "07:45",
  "07:50",
  "07:55",
  "08:00",
  "08:05",
  "08:10",
  "08:15",
  "08:20",
  "08:25",
  "08:30",
  "08:35",
  "08:40",
  "08:45",
  "08:50",
  "08:55",
  "09:00",
  "09:05",
  "09:10",
  "09:15",
  "09:20",
  "09:25",
  "09:30",
  "09:35",
  "09:40",
  "09:45",
  "09:50",
  "09:55",
  "10:00",
  "10:05",
  "10:10",
  "10:15",
  "10:20",
  "10:25",
  "10:30",
  "10:35",
  "10:40",
  "10:45",
  "10:50",
  "10:55",
  "11:00",
  "11:05",
  "11:10",
  "11:15",
  "11:20",
  "11:25",
  "11:30",
  "11:35",
  "11:40",
  "11:45",
  "11:50",
  "11:55",
  "12:00",
  "12:05",
  "12:10",
  "12:15",
  "12:20",
  "12:25",
  "12:30",
  "12:35",
  "12:40",
  "12:45",
  "12:50",
  "12:55",
  "13:00",
  "13:05",
  "13:10",
  "13:15",
  "13:20",
  "13:25",
  "13:30",
  "13:35",
  "13:40",
  "13:45",
  "13:50",
  "13:55",
  "14:00",
  "14:05",
  "14:10",
  "14:15",
  "14:20",
  "14:25",
  "14:30",
  "14:35",
  "14:40",
  "14:45",
  "14:50",
  "14:55",
  "15:00",
  "15:05",
  "15:10",
  "15:15",
  "15:20",
  "15:25",
  "15:30",
  "15:35",
  "15:40",
  "15:45",
  "15:50",
  "15:55",
  "16:00",
  "16:05",
  "16:10",
  "16:15",
  "16:20",
  "16:25",
  "16:30",
  "16:35",
  "16:40",
  "16:45",
  "16:50",
  "16:55",
  "17:00",
  "17:05",
  "17:10",
  "17:15",
  "17:20",
  "17:25",
  "17:30",
  "17:35",
  "17:40",
  "17:45",
  "17:50",
  "17:55",
  "18:00",
  "18:05",
  "18:10",
  "18:15",
  "18:20",
  "18:25",
  "18:30",
  "18:35",
  "18:40",
  "18:45",
  "18:50",
  "18:55",
  "19:00",
  "19:05",
  "19:10",
  "19:15",
  "19:20",
  "19:25",
  "19:30",
  "19:35",
  "19:40",
  "19:45",
  "19:50",
  "19:55",
  "20:00",
  "20:05",
  "20:10",
  "20:15",
  "20:20",
  "20:25",
  "20:30",
  "20:35",
  "20:40",
  "20:45",
  "20:50",
  "20:55",
  "21:00",
  "21:05",
  "21:10",
  "21:15",
  "21:20",
  "21:25",
  "21:30",
  "21:35",
  "21:40",
  "21:45",
  "21:50",
  "21:55",
  "22:00",
  "22:05",
  "22:10",
  "22:15",
  "22:20",
  "22:25",
  "22:30",
  "22:35",
  "22:40",
  "22:45",
  "22:50",
  "22:55",
  "23:00",
  "23:05",
  "23:10",
  "23:15",
  "23:20",
  "23:25",
  "23:30",
  "23:35",
  "23:40",
  "23:45",
  "23:50",
  "23:55",
];

const JustHours = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];

const JustMinutos = [
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

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
        Variables_Diarios.ultima_modificacion = horas[horas.length - 32];
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
            var inyeccion = 0;
            var capacidadmaxima = [];
            if (company.tariff_type == "GDMTH") {
              // todo falta para otras tarifas
              let base = res.GDMTH.basePrice;
              let intermedio = res.GDMTH.middlePrice;
              let punta = res.GDMTH.peakPrice;
              var fecha2 = Dia.split("/");

              var diaelemento = fecha2[0];
              var meselemento = fecha2[1];
              var añoelemento = fecha2[2];

              var date = moment(
                añoelemento + "-" + meselemento + "-" + diaelemento
              );
              var hoy = date.day();
              var contador = 0;
              var valores = TodosLosRegistros[0].toObject();
              for (var i in valores) {
                if (contador > 2) {
                  // es una hora
                  var horas = i.split(":");
                  // console.log("hora", horas[0]);

                  if (hoy <= 5) {
                    // LUNES A VIERNES
                    if (horas[0] <= 5) {
                      // de 00:00 a 5:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      inyeccion += valores[i].EP_EXP_kWh * base;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 6 && horas[0] <= 19) {
                      // de 06:00 a 19:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      inyeccion += valores[i].EP_EXP_kWh * intermedio;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 20 && horas[0] <= 21) {
                      // de 20:00 a 21:59
                      sumatoria_Costo += valores[i].EP_IMP_kWh * punta;
                      inyeccion += valores[i].EP_EXP_kWh * punta;
                      capacidadmaxima.push(valores[i].EP_IMP_kWh);
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }

                    if (horas[0] >= 22 && horas[0] <= 24) {
                      // de 22:00 a 23:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      inyeccion += valores[i].EP_EXP_kWh * intermedio;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                  if (hoy == 6) {
                    // SABADOOOOOOOOO
                    if (horas[0] <= 6) {
                      // de 00:00 a 6:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      inyeccion += valores[i].EP_EXP_kWh * base;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 7 && horas[0] <= 24) {
                      // de 07:00 a 19:59
                      //console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      inyeccion += valores[i].EP_EXP_kWh * intermedio;
                      //console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                  if (hoy == 7) {
                    // Domingo
                    if (horas[0] <= 18) {
                      // de 00:00 a 18:59
                      //console.log("base");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * base;
                      inyeccion += valores[i].EP_EXP_kWh * base;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                    if (horas[0] >= 19 && horas[0] <= 24) {
                      // de 07:00 a 19:59
                      // console.log("intermedio");
                      sumatoria_Costo += valores[i].EP_IMP_kWh * intermedio;
                      inyeccion += valores[i].EP_EXP_kWh * intermedio;
                      // console.log("valor", valores[i].EP_IMP_kWh);
                    }
                  }
                }
                contador = contador + 1;
              }

              let object = {};
              if (capacidadmaxima.length == 0) {
                capacidadmaxima = [0, 0];
              }

              object.Capacidad = Math.max(...capacidadmaxima);
              object.CapacidadCosto = object.Capacidad * punta;

              object.inyeccionCosto = inyeccion.toFixed(2);
              object.CostoConsumo = sumatoria_Costo.toFixed(2);
              cb(null, object);
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
        var inyeccionCosto = [];
        var arregloCapacidad = [];
        var arregloCapacidadCosto = [];
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
                var valor = parseInt(valoresDiarios.CostoConsumo);
                var valor2 = parseInt(valoresDiarios.inyeccionCosto);
                var capacidad = parseInt(valoresDiarios.Capacidad);
                var costocapacidad = parseInt(valoresDiarios.CapacidadCosto);

                arregloCapacidad.push(capacidad);
                arregloCapacidadCosto.push(costocapacidad);
                arreglocostos.push(valor);
                inyeccionCosto.push(valor2);
              }
            );
          }
        }
        setTimeout(function () {
          let object = {};
          var sum = 0;
          for (var i in arreglocostos) {
            sum += arreglocostos[i];
          }
          var sum2 = 0;
          for (var x in inyeccionCosto) {
            sum2 += inyeccionCosto[x];
          }
          var sum3 = 0;
          for (var z in arregloCapacidad) {
            sum3 += arregloCapacidad[z];
          }

          var sum4 = 0;
          for (var y in arregloCapacidadCosto) {
            sum4 += arregloCapacidadCosto[y];
          }

          object.CostoCapacidad = sum4;
          object.Capacidad = sum3;
          object.CostoConsumo = sum;
          object.inyeccionCosto = sum2;

          cb(null, object);
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
        if (
          moment(fechadelelemento).isBetween(inicioMes, end) ||
          fechadelelemento == inicioMes
        ) {
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
        if (
          moment(fechadelelemento).isBetween(inicioMes, end) ||
          fechadelelemento == inicioMes
        ) {
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
          if (
            moment(fechadelelemento).isBetween(inicioMes, end) ||
            fechadelelemento == inicioMes
          ) {
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

  Minutes.DistributionPeriodDiario = function (
    DesignatedMeterId,
    periodo,
    id_empresa,
    cb
  ) {
    console.log(DesignatedMeterId, periodo, id_empresa);

    var Dia = moment().format("L");
    var fecha = Dia.split("/");
    var mes = fecha[1];
    var año = fecha[2];
    console.log(Dia, "soy dia alv");
    Minutes.find({
      where: {
        Dia: Dia,
        DesignatedMeterId: DesignatedMeterId,
      },
    })
      .then((TodosLosRegistros) => {
        var demandas = [];
        var epimpDiario = 0;
        const Minutess = app.loopback.getModel("Minutes");
        var start = moment().format("L");
        console.log(TodosLosRegistros);

        //   console.log( TodosLosRegistros[i].Dia, moment(fechadelelemento).isBetween(inicioMes, end) );
        Minutess.VariablesMedidorUltimaHora(start, DesignatedMeterId, function (
          err,
          valoresDiarios
        ) {
          demandas.push(valoresDiarios.DMD_P_kW);
          epimpDiario = epimpDiario + valoresDiarios.EP_IMP_kWh;
        });

        setTimeout(function () {
          demandas = Math.max(...demandas);
          console.log(
            "Maximo de demanda diario",
            demandas,
            "con epimp recaudado de diario",
            epimpDiario
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
                  var resultado = {};
                  resultado.value = epimpDiario / (moment().hours() * 1 * fc);
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

  Minutes.remoteMethod("DistributionPeriodDiario", {
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

  Minutes.InyeccionPeriod = function (
    DesignatedMeterId,
    periodo,
    id_empresa,
    cb
  ) {
    console.log(DesignatedMeterId, periodo, id_empresa);
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
        var InyeccionMensual = 0;
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
          if (
            moment(fechadelelemento).isBetween(inicioMes, end) ||
            fechadelelemento == inicioMes
          ) {
            Minutess.VariablesMedidorUltimaHora(
              TodosLosRegistros[i].Dia,
              DesignatedMeterId,
              function (err, valoresDiarios) {
                InyeccionMensual = InyeccionMensual + valoresDiarios.EP_EXP_kWh;
                console.log(valoresDiarios);
              }
            );
          }
        }
        setTimeout(function () {
          var Inyeccion = InyeccionMensual;
          console.log("con Inyeccion recaudado del mes", Inyeccion);
          cb(null, Inyeccion);
        }, 600);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  Minutes.remoteMethod("InyeccionPeriod", {
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

  Minutes.NetCodeReadings = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    variables, // arreglo con variables
    interval, //cada cuanto (super f)
    cb
  ) {
    console.log(
      "entro esto ",
      DesignatedMeterId, //idMedidor
      filter, // 0 es hoy 3 es mensual
      variables, // arreglo con variables
      interval
    );
    if (filter == 0 && interval == 300) {
      // HOY  y 5 minutos

      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadings5Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );

      // aqui poner buscar por hora jaja xd
    }

    if (filter == 0 && interval == 900) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadings15Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 0 && interval == 1800) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadings30Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 0 && interval == 3600) {
      var start = moment().format("L");
      var fecha = start.split("/");
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadingsHours(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 1 && interval == 300) {
      // ayer  y 5 minutos

      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadings5Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          console.log(err);
          cb(null, ok);
        }
      );

      // aqui poner buscar por hora jaja xd
    }

    if (filter == 1 && interval == 900) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadings15Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 1 && interval == 1800) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.NetCodeReadings30Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 1 && interval == 3600) {
      var start = moment().subtract(1, "days").format("L");
      var fecha = start.split("/");
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.NetCodeReadingsHours(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 2 && interval == 300) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = {};
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.NetCodeReadings5Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }
      setTimeout(function () {
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            array[key] = []; // si lo dejamos adentro del for anidado abajo, se sobreescriben las llaves
          }
        }
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            for (var valor in arreglo[dia][key]) {
              array[key].push(arreglo[dia][key][valor]);
            }
          }
        }

        console.log(array);
        return cb(null, array);
      }, 3000);
    }

    //////////////////////////////////////////////////// 15 minutos ////////////////////////////////////////////////

    if (filter == 2 && interval == 900) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = {};
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.NetCodeReadings15Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }
      setTimeout(function () {
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            array[key] = []; // si lo dejamos adentro del for anidado abajo, se sobreescriben las llaves
          }
        }
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            for (var valor in arreglo[dia][key]) {
              array[key].push(arreglo[dia][key][valor]);
            }
          }
        }

        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    //////////////////////////////////////////////////// 15 minutos ////////////////////////////////////////////////

    if (filter == 2 && interval == 1800) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = {};
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.NetCodeReadings30Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }
      setTimeout(function () {
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            array[key] = []; // si lo dejamos adentro del for anidado abajo, se sobreescriben las llaves
          }
        }
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            for (var valor in arreglo[dia][key]) {
              array[key].push(arreglo[dia][key][valor]);
            }
          }
        }

        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    ////////////////////////////////////////////////////////////// HORA
    if (filter == 2 && interval == 3600) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = {};
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.NetCodeReadingsHours(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }
      setTimeout(function () {
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            array[key] = []; // si lo dejamos adentro del for anidado abajo, se sobreescriben las llaves
          }
        }
        for (var dia in arreglo) {
          for (var key in arreglo[dia]) {
            for (var valor in arreglo[dia][key]) {
              array[key].push(arreglo[dia][key][valor]);
            }
          }
        }

        return cb(null, array);
      }, 1500);
    }

    console.log(DesignatedMeterId, filter, variables, interval);
  };

  Minutes.remoteMethod("NetCodeReadings", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "variables", type: "array" },
      { arg: "interval", type: "number" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.NetCodeReadings5Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables, // arreglo con variables
    cb
  ) {
    console.log("entre a netcode");
    //poniendo bien las variables
    if (variables[0] == "Vab") {
      variables = ["V12", "V23", "V31"];
    }

    if (variables[0] == "Ia") {
      variables = ["Ia", "Ib", "Ic"];
    }

    if (variables[0] == "THDIa") {
      variables = ["THDIa", "THDIb", "THDIc"];
    }

    if (variables[0] == "Vunbl") {
      variables = ["Vunbl", "lunbl"];
    }

    if (variables[0] == "Ssist") {
      variables = ["Ssist"];
    }

    if (variables[0] == "FPa") {
      variables = ["FPa", "FPb", "FPc"];
    }

    //
    if (filter == 0) {
      // hoy
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = {};
        for (const variable of variables) {
          values[variable] = [];
          valores[variable] = [];
        }

        for (var i in horas) {
          var comparar = horas[i].split(":");
          if (comparar[0] > moment().hour() - 1) {
          } else {
            if (
              moment().hour() - 1 == comparar[0] &&
              comparar[1] > moment().minutes()
            ) {
            } else {
              for (const key in values) {
                var fecha = dia.split("/");
                var fechabien =
                  fecha[0] +
                  fecha[1] +
                  fecha[2] +
                  comparar[0] +
                  comparar[1] +
                  "00";

                values[key] = {
                  value: 0,
                  date: fechabien, // cambiar null por un parse de date horas[i]
                };

                if (ok[0][horas[i]]) {
                  //////////////////////////////////////////////////  VOLTAJE
                  // detecta cuando esta online
                  if (key == "V12") {
                    values[key].value = ok[0][horas[i]].V12;
                    // console.log(values);
                  }
                  if (key == "V23") {
                    values[key].value = ok[0][horas[i]].V23;
                    //console.log(values);
                  }
                  if (key == "V31") {
                    values[key].value = ok[0][horas[i]].V31;
                    // console.log(values);
                  }
                  //////////////////////////////////////////////////  AMPERAJE
                  if (key == "Ia") {
                    values[key].value = ok[0][horas[i]].Ia;
                    // console.log(values);
                  }
                  if (key == "Ib") {
                    values[key].value = ok[0][horas[i]].Ib;
                    //console.log(values);
                  }
                  if (key == "Ic") {
                    values[key].value = ok[0][horas[i]].Ic;
                    // console.log(values);
                  }
                  //////////////////////////////////////////////////  THD

                  if (key == "THDIa") {
                    values[key].value = ok[0][horas[i]].THD_Ia;
                    // console.log(values);
                  }
                  if (key == "THDIb") {
                    values[key].value = ok[0][horas[i]].THD_Ib;
                    //console.log(values);
                  }
                  if (key == "THDIc") {
                    values[key].value = ok[0][horas[i]].THD_Ic;
                    // console.log(values);
                  }

                  ///////////////////////////////////////////////////// Desbalance

                  if (key == "Vunbl") {
                    values[key].value = ok[0][horas[i]].Unbl_U;
                    //console.log(values);
                  }
                  if (key == "lunbl") {
                    values[key].value = ok[0][horas[i]].Unbl_I;
                    // console.log(values);
                  }

                  //////////////////////////////////////////////////////// SUMA KVA

                  if (key == "Ssist") {
                    values[key].value = ok[0][horas[i]].Ssum_KVA;
                    // console.log(values);
                  }

                  ///////////////////////////////////////////////////////// venga brother

                  if (key == "FPa") {
                    values[key].value = ok[0][horas[i]].PF1;
                    // console.log(values);
                  }
                  if (key == "FPb") {
                    values[key].value = ok[0][horas[i]].PF2;
                    //console.log(values);
                  }
                  if (key == "FPc") {
                    values[key].value = ok[0][horas[i]].PF3;
                    // console.log(values);
                  }
                }

                valores[key].push(values[key]); // los empieza a escribir bien
              }
            }
          }
        }
        return cb(null, valores);
      });
    }

    if (filter != 0) {
      // DA TODAS LAS HORAS POSIBLEWS ( SIN IF )
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = {};
        for (const variable of variables) {
          values[variable] = [];
          valores[variable] = [];
        }

        for (var i in horas) {
          var comparar = horas[i].split(":");

          for (const key in values) {
            var fecha = dia.split("/");
            var fechabien =
              fecha[0] + fecha[1] + fecha[2] + comparar[0] + comparar[1] + "00";

            values[key] = {
              value: 0,
              date: fechabien, // cambiar null por un parse de date horas[i]
            };

            if (ok[0][horas[i]]) {
              //////////////////////////////////////////////////  VOLTAJE
              // detecta cuando esta online
              if (key == "V12") {
                values[key].value = ok[0][horas[i]].V12;
                // console.log(values);
              }
              if (key == "V23") {
                values[key].value = ok[0][horas[i]].V23;
                //console.log(values);
              }
              if (key == "V31") {
                values[key].value = ok[0][horas[i]].V31;
                // console.log(values);
              }
              //////////////////////////////////////////////////  AMPERAJE
              if (key == "Ia") {
                values[key].value = ok[0][horas[i]].Ia;
                // console.log(values);
              }
              if (key == "Ib") {
                values[key].value = ok[0][horas[i]].Ib;
                //console.log(values);
              }
              if (key == "Ic") {
                values[key].value = ok[0][horas[i]].Ic;
                // console.log(values);
              }
              //////////////////////////////////////////////////  THD

              if (key == "THDIa") {
                values[key].value = ok[0][horas[i]].THD_Ia;
                // console.log(values);
              }
              if (key == "THDIb") {
                values[key].value = ok[0][horas[i]].THD_Ib;
                //console.log(values);
              }
              if (key == "THDIc") {
                values[key].value = ok[0][horas[i]].THD_Ic;
                // console.log(values);
              }

              ///////////////////////////////////////////////////// Desbalance

              if (key == "Vunbl") {
                values[key].value = ok[0][horas[i]].Unbl_U;
                //console.log(values);
              }
              if (key == "lunbl") {
                values[key].value = ok[0][horas[i]].Unbl_I;
                // console.log(values);
              }

              //////////////////////////////////////////////////////// SUMA KVA

              if (key == "Ssist") {
                values[key].value = ok[0][horas[i]].Ssum_KVA;
                // console.log(values);
              }

              ///////////////////////////////////////////////////////// venga brother

              if (key == "FPa") {
                values[key].value = ok[0][horas[i]].PF1;
                // console.log(values);
              }
              if (key == "FPb") {
                values[key].value = ok[0][horas[i]].PF2;
                //console.log(values);
              }
              if (key == "FPc") {
                values[key].value = ok[0][horas[i]].PF3;
                // console.log(values);
              }
            }

            valores[key].push(values[key]); // los empieza a escribir bien
          }
        }

        return cb(null, valores);
      });
    }

    // aqui poner buscar por hora jaja xd
  };

  Minutes.remoteMethod("NetCodeReadings5Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "array" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.NetCodeReadingsHours = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables, // arreglo con variables
    cb
  ) {
    //poniendo bien las variables
    if (variables[0] == "Vab") {
      variables = ["V12", "V23", "V31"];
    }

    if (variables[0] == "Ia") {
      variables = ["Ia", "Ib", "Ic"];
    }

    if (variables[0] == "THDIa") {
      variables = ["THDIa", "THDIb", "THDIc"];
    }

    if (variables[0] == "Vunbl") {
      variables = ["Vunbl", "lunbl"];
    }

    if (variables[0] == "Ssist") {
      variables = ["Ssist"];
    }

    if (variables[0] == "FPa") {
      variables = ["FPa", "FPb", "FPc"];
    }
    //
    if (filter == 0) {
      // hoy
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = {};
        let comparadorfinal = {};
        var array = {};
        for (const variable of variables) {
          values[variable] = [];
          valores[variable] = [];
          comparadorfinal = [];
        }

        for (var i in JustHours) {
          if (comparar >= moment().hour() - 1) {
          } else {
            for (const key in values) {
              var fecha = dia.split("/");
              var fechabien =
                fecha[0] + fecha[1] + fecha[2] + JustHours[i] + "0000";

              values[key] = {
                value: 0,
                date: fechabien, // cambiar null por un parse de date horas[i]
              };

              for (var x in JustMinutos) {
                var nuevocomp = JustHours[i] + ":" + JustMinutos[x];

                var comparar = JustHours[i];
                //   console.log(comparar >= moment().hour() - 1);

                if (ok[0][nuevocomp]) {
                  //////////////////////////////////////////////////  VOLTAJE
                  // detecta cuando esta online
                  if (key == "V12") {
                    values[key].value = ok[0][nuevocomp].V12;
                    // console.log(values);
                  }
                  if (key == "V23") {
                    values[key].value = ok[0][nuevocomp].V23;
                    //console.log(values);
                  }
                  if (key == "V31") {
                    values[key].value = ok[0][nuevocomp].V31;
                    // console.log(values);
                  }
                  //////////////////////////////////////////////////  AMPERAJE
                  if (key == "Ia") {
                    values[key].value = ok[0][nuevocomp].Ia;
                    // console.log(values);
                  }
                  if (key == "Ib") {
                    values[key].value = ok[0][nuevocomp].Ib;
                    //console.log(values);
                  }
                  if (key == "Ic") {
                    values[key].value = ok[0][nuevocomp].Ic;
                    // console.log(values);
                  }
                  //////////////////////////////////////////////////  THD

                  if (key == "THDIa") {
                    values[key].value = ok[0][nuevocomp].THD_Ia;
                    // console.log(values);
                  }
                  if (key == "THDIb") {
                    values[key].value = ok[0][nuevocomp].THD_Ib;
                    //console.log(values);
                  }
                  if (key == "THDIc") {
                    values[key].value = ok[0][nuevocomp].THD_Ic;
                    // console.log(values);
                  }

                  ///////////////////////////////////////////////////// Desbalance

                  if (key == "Vunbl") {
                    values[key].value = ok[0][nuevocomp].Unbl_U;
                    //console.log(values);
                  }
                  if (key == "lunbl") {
                    values[key].value = ok[0][nuevocomp].Unbl_I;
                    // console.log(values);
                  }

                  //////////////////////////////////////////////////////// SUMA KVA

                  if (key == "Ssist") {
                    values[key].value = ok[0][nuevocomp].Ssum_KVA;
                    // console.log(values);
                  }

                  ///////////////////////////////////////////////////////// venga brother

                  if (key == "FPa") {
                    values[key].value = ok[0][nuevocomp].PF1;
                    // console.log(values);
                  }
                  if (key == "FPb") {
                    values[key].value = ok[0][nuevocomp].PF2;
                    //console.log(values);
                  }
                  if (key == "FPc") {
                    values[key].value = ok[0][nuevocomp].PF3;
                    // console.log(values);
                  }
                }

                valores[key].push(values[key]); // los empieza a escribir bien
              }
            }
          }
        }

        for (var key in valores) {
          console.log(key);
          array[key] = [];
          var z = 0;
          for (z in valores[key]) {
            var resto = z % 11;
            if (resto == 0) {
              array[key].push(valores[key][z]);
            } else {
            }
          }
        }

        setTimeout(function () {
          cb(null, array);
        }, 1000);
      });
    }

    if (filter != 0) {
      // hoy
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = {};
        let comparadorfinal = {};
        var array = {};
        for (const variable of variables) {
          values[variable] = [];
          valores[variable] = [];
          comparadorfinal = [];
        }

        for (var i in JustHours) {
          for (const key in values) {
            var fecha = dia.split("/");
            var fechabien =
              fecha[0] + fecha[1] + fecha[2] + JustHours[i] + "0000";

            values[key] = {
              value: 0,
              date: fechabien, // cambiar null por un parse de date horas[i]
            };

            for (var x in JustMinutos) {
              var nuevocomp = JustHours[i] + ":" + JustMinutos[x];

              var comparar = JustHours[i];
              //   console.log(comparar >= moment().hour() - 1);

              if (ok[0][nuevocomp]) {
                //////////////////////////////////////////////////  VOLTAJE
                // detecta cuando esta online
                if (key == "V12") {
                  values[key].value = ok[0][nuevocomp].V12;
                  // console.log(values);
                }
                if (key == "V23") {
                  values[key].value = ok[0][nuevocomp].V23;
                  //console.log(values);
                }
                if (key == "V31") {
                  values[key].value = ok[0][nuevocomp].V31;
                  // console.log(values);
                }
                //////////////////////////////////////////////////  AMPERAJE
                if (key == "Ia") {
                  values[key].value = ok[0][nuevocomp].Ia;
                  // console.log(values);
                }
                if (key == "Ib") {
                  values[key].value = ok[0][nuevocomp].Ib;
                  //console.log(values);
                }
                if (key == "Ic") {
                  values[key].value = ok[0][nuevocomp].Ic;
                  // console.log(values);
                }
                //////////////////////////////////////////////////  THD

                if (key == "THDIa") {
                  values[key].value = ok[0][nuevocomp].THD_Ia;
                  // console.log(values);
                }
                if (key == "THDIb") {
                  values[key].value = ok[0][nuevocomp].THD_Ib;
                  //console.log(values);
                }
                if (key == "THDIc") {
                  values[key].value = ok[0][nuevocomp].THD_Ic;
                  // console.log(values);
                }

                ///////////////////////////////////////////////////// Desbalance

                if (key == "Vunbl") {
                  values[key].value = ok[0][nuevocomp].Unbl_U;
                  //console.log(values);
                }
                if (key == "lunbl") {
                  values[key].value = ok[0][nuevocomp].Unbl_I;
                  // console.log(values);
                }

                //////////////////////////////////////////////////////// SUMA KVA

                if (key == "Ssist") {
                  values[key].value = ok[0][nuevocomp].Ssum_KVA;
                  // console.log(values);
                }

                ///////////////////////////////////////////////////////// venga brother

                if (key == "FPa") {
                  values[key].value = ok[0][nuevocomp].PF1;
                  // console.log(values);
                }
                if (key == "FPb") {
                  values[key].value = ok[0][nuevocomp].PF2;
                  //console.log(values);
                }
                if (key == "FPc") {
                  values[key].value = ok[0][nuevocomp].PF3;
                  // console.log(values);
                }
              }

              valores[key].push(values[key]); // los empieza a escribir bien
            }
          }
        }

        for (var key in valores) {
          array[key] = [];
          var z = 0;
          for (z in valores[key]) {
            var resto = z % 11;
            if (resto == 0) {
              array[key].push(valores[key][z]);
            } else {
            }
          }
        }

        setTimeout(function () {
          cb(null, array);
        }, 1000);
      });
    }

    // aqui poner buscar por hora jaja xd
  };

  Minutes.remoteMethod("NetCodeReadingsHours", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "array" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.NetCodeReadings15Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables, // arreglo con variables
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.NetCodeReadings5Mins(
      DesignatedMeterId,
      filter,
      dia,
      variables,
      function (err, ok) {
        var array = {};
        for (var x in ok) {
          array[x] = [];
          var z = 0;
          for (z in ok[x]) {
            var resto = z % 3;
            if (resto == 0) {
              var valorfinal = ok[x][z].value;

              if (ok[x][z - 1]) {
                valorfinal = valorfinal + ok[x][z - 1].value;
              }
              if (ok[x][z - 2]) {
                valorfinal = valorfinal + ok[x][z - 2].value;
              }

              ok[x][z].value = valorfinal;

              array[x].push(ok[x][z]);
            }
          }
        }

        cb(null, array);
      }
    );

    // aqui poner buscar por hora jaja xd
  };

  Minutes.remoteMethod("NetCodeReadings15Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "array" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.NetCodeReadings30Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables, // arreglo con variables
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.NetCodeReadings5Mins(
      DesignatedMeterId,
      filter,
      dia,
      variables,
      function (err, ok) {
        var array = {};
        for (var x in ok) {
          array[x] = [];
          var z = 0;
          for (z in ok[x]) {
            var resto = z % 6;
            if (resto == 0) {
              var valorfinal = ok[x][z].value;

              if (ok[x][z - 1]) {
                valorfinal = valorfinal + ok[x][z - 1].value;
              }
              if (ok[x][z - 2]) {
                valorfinal = valorfinal + ok[x][z - 2].value;
              }

              if (ok[x][z - 3]) {
                valorfinal = valorfinal + ok[x][z - 3].value;
              }
              if (ok[x][z - 4]) {
                valorfinal = valorfinal + ok[x][z - 4].value;
              }
              if (ok[x][z - 5]) {
                valorfinal = valorfinal + ok[x][z - 5].value;
              }

              ok[x][z].value = valorfinal;

              array[x].push(ok[x][z]);
            }
          }
        }

        cb(null, array);
      }
    );

    // aqui poner buscar por hora jaja xd
  };

  Minutes.remoteMethod("NetCodeReadings30Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "array" },
    ],

    returns: {
      arg: "response",
      type: "object",
    },
  });

  Minutes.StandardReadings5Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables,
    cb
  ) {
    console.log(DesignatedMeterId);
    if (filter == 0) {
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        console.log("ok", ok);
        let values = {};
        let valores = [];

        for (var i in horas) {
          var comparar = horas[i].split(":");
          if (comparar[0] > moment().hour() - 1) {
          } else {
            if (
              moment().hour() - 1 == comparar[0] &&
              comparar[1] > moment().minutes()
            ) {
            } else {
              var fecha = dia.split("/");
              var fechabien =
                fecha[0] +
                fecha[1] +
                fecha[2] +
                comparar[0] +
                comparar[1] +
                "00";
              if (variables == "EPimp") {
                values = {
                  value: 0,
                  date: fechabien, // cambiar null por un parse de date horas[i]
                };
              } else {
                values = {
                  value: 0,
                  isPeak: false,
                  date: fechabien, // cambiar null por un parse de date horas[i]
                };
              }
              if (ok[0][horas[i]]) {
                if (variables == "DP") {
                  values.value = ok[0][horas[i]].DMD_P_kW;
                  Minutessss.Ispeak(
                    DesignatedMeterId,
                    horas[i],
                    fecha[2] + "-" + fecha[1] + "-" + fecha[0],
                    function (err, respuesta) {
                      values.isPeak = respuesta;
                    }
                  );
                }
                if (variables == "EPimp") {
                  values.value = ok[0][horas[i]].EP_IMP_kWh;
                }
              }
              Minutessss.Ispeak(
                DesignatedMeterId,
                horas[i],
                fecha[2] + "-" + fecha[1] + "-" + fecha[0],
                function (err, respuesta) {
                  values.isPeak = respuesta;
                }
              );
              valores.push(values);
            }
          }
        }
        return cb(null, valores);
      });
    }

    if (filter != 0) {
      console.log(DesignatedMeterId, filter, dia, variables);
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = [];

        for (var i in horas) {
          var comparar = horas[i].split(":");

          var fecha = dia.split("/");
          var fechabien =
            fecha[0] + fecha[1] + fecha[2] + comparar[0] + comparar[1] + "00";

          if (variables == "EPimp") {
            values = {
              value: 0,
              date: fechabien, // cambiar null por un parse de date horas[i]
            };
          } else {
            values = {
              value: 0,
              isPeak: false,
              date: fechabien, // cambiar null por un parse de date horas[i]
            };
          }
          if (ok[0][horas[i]]) {
            if (variables == "DP") {
              values.value = ok[0][horas[i]].DMD_P_kW;
              Minutessss.Ispeak(
                DesignatedMeterId,
                horas[i],
                fecha[2] + "-" + fecha[1] + "-" + fecha[0],
                function (err, respuesta) {
                  values.isPeak = respuesta;
                }
              );
            }
            if (variables == "EPimp") {
              values.value = ok[0][horas[i]].EP_IMP_kWh;
            }
          }
          Minutessss.Ispeak(
            DesignatedMeterId,
            horas[i],
            fecha[2] + "-" + fecha[1] + "-" + fecha[0],
            function (err, respuesta) {
              values.isPeak = respuesta;
            }
          );
          valores.push(values);
        }
        return cb(null, valores);
      });
    }
  };

  Minutes.remoteMethod("StandardReadings5Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.Ispeak = function (DesignatedMeterId, horas, dia, cb) {
    // TODO sacar el company y division con designatedmeterid
    let VARIABLE = "GDMTH";
    var date = moment(dia);

    var hoy = date.day();

    if (hoy == 0) {
      hoy = 7;
    }

    var horas = horas.split(":");
    // console.log("hora", horas[0]);
    horas[0] = parseInt(horas[0]);

    if (hoy < 5) {
      // LUNES A VIERNES

      if (horas[0] <= 5) {
        // de 00:00 a 5:59
        //console.log("base");
        return cb(null, false);
        //console.log("valor", valores[i].EP_IMP_kWh);
      }
      if (horas[0] >= 6 && horas[0] <= 19) {
        // de 06:00 a 19:59
        //console.log("intermedio");
        return cb(null, false);
        //console.log("valor", valores[i].EP_IMP_kWh);
      }
      if (horas[0] >= 20 && horas[0] <= 21) {
        // de 20:00 a 21:59
        //console.log("Punta");
        return cb(null, true);
        //console.log("valor", valores[i].EP_IMP_kWh);
      }

      if (horas[0] >= 22 && horas[0] <= 24) {
        // de 22:00 a 23:59
        //console.log("intermedio");
        return cb(null, false);
        // console.log("valor", valores[i].EP_IMP_kWh);
      }
    }
    if (hoy == 6) {
      // SABADOOOOOOOOO
      if (horas[0] <= 6) {
        // de 00:00 a 6:59
        //console.log("base");
        return cb(null, false);
        // console.log("valor", valores[i].EP_IMP_kWh);
      }
      if (horas[0] >= 7 && horas[0] <= 24) {
        // de 07:00 a 19:59
        //console.log("intermedio");
        return cb(null, false);
        //console.log("valor", valores[i].EP_IMP_kWh);
      }
    }
    if (hoy == 7) {
      // Domingo
      if (horas[0] <= 18) {
        // de 00:00 a 18:59
        //console.log("base");
        return cb(null, false);
        // console.log("valor", valores[i].EP_IMP_kWh);
      }
      if (horas[0] >= 19 && horas[0] <= 24) {
        // de 07:00 a 19:59
        // console.log("intermedio");
        return cb(null, false);
        // console.log("valor", valores[i].EP_IMP_kWh);
      }
    }
  };

  Minutes.remoteMethod("Ispeak", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "horas", type: "string" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.StandardReadings = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    interval,
    variables,

    cb
  ) {
    console.log(designatedMeter, filter, interval, variables);
    if (filter == 0 && interval == 300) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings5Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 0 && interval == 900) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings15Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 0 && interval == 1800) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings30Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 0 && interval == 3600) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.StandardReadingsHours(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 1 && interval == 300) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings5Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 1 && interval == 900) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings15Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 1 && interval == 1800) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.StandardReadings30Mins(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 1 && interval == 3600) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.StandardReadingsHours(
        DesignatedMeterId,
        filter,
        start,
        variables,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 2 && interval == 300) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings5Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    if (filter == 2 && interval == 900) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings15Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    if (filter == 2 && interval == 1800) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings30Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    if (filter == 2 && interval == 3600) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadingsHours(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }
    if (filter == 3 && interval == 300) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings5Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }

    if (filter == 3 && interval == 900) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings15Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }
    if (filter == 3 && interval == 1800) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadings30Mins(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }
    if (filter == 3 && interval == 3600) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.StandardReadingsHours(
          DesignatedMeterId,
          filter,
          start,
          variables,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }
  };

  Minutes.remoteMethod("StandardReadings", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
      { arg: "variables", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.StandardReadings15Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables,
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.StandardReadings5Mins(
      DesignatedMeterId,
      filter,
      dia,
      variables,
      function (err, ok) {
        var array = [];
        for (var x in ok) {
          var resto = x % 3;
          if (resto == 0) {
            var valorfinal = ok[x].value;

            if (ok[x - 1]) {
              valorfinal = valorfinal + ok[x - 1].value;
            }
            if (ok[x - 1]) {
              valorfinal = valorfinal + ok[x - 2].value;
            }

            ok[x].value = valorfinal;
            array.push(ok[x]);
          }
        }

        cb(null, array);
      }
    );
  };

  Minutes.remoteMethod("StandardReadings15Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.StandardReadings30Mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables,
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.StandardReadings5Mins(
      DesignatedMeterId,
      filter,
      dia,
      variables,
      function (err, ok) {
        var array = [];
        for (var x in ok) {
          var resto = x % 6;

          if (resto == 0) {
            var valorfinal = ok[x].value;

            if (ok[x - 1]) {
              valorfinal = valorfinal + ok[x - 1].value;
            }
            if (ok[x - 2]) {
              valorfinal = valorfinal + ok[x - 2].value;
            }
            if (ok[x - 3]) {
              valorfinal = valorfinal + ok[x - 3].value;
            }
            if (ok[x - 4]) {
              valorfinal = valorfinal + ok[x - 4].value;
            }
            if (ok[x - 5]) {
              valorfinal = valorfinal + ok[x - 5].value;
            }

            ok[x].value = valorfinal;
            array.push(ok[x]);
          }
        }

        cb(null, array);
      }
    );
  };

  Minutes.remoteMethod("StandardReadings30Mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.StandardReadingsHours = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    variables,
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.StandardReadings5Mins(
      DesignatedMeterId,
      filter,
      dia,
      variables,
      function (err, ok) {
        var array = [];
        for (var x in ok) {
          var resto = x % 12;

          if (resto == 0) {
            console.log(ok[x]);
            var valorfinal = ok[x].value;

            if (ok[x - 1]) {
              valorfinal = valorfinal + ok[x - 1].value;
            }
            if (ok[x - 2]) {
              valorfinal = valorfinal + ok[x - 2].value;
            }
            if (ok[x - 3]) {
              valorfinal = valorfinal + ok[x - 3].value;
            }
            if (ok[x - 4]) {
              valorfinal = valorfinal + ok[x - 4].value;
            }
            if (ok[x - 5]) {
              valorfinal = valorfinal + ok[x - 5].value;
            }
            if (ok[x - 6]) {
              valorfinal = valorfinal + ok[x - 6].value;
            }
            if (ok[x - 7]) {
              valorfinal = valorfinal + ok[x - 7].value;
            }
            if (ok[x - 8]) {
              valorfinal = valorfinal + ok[x - 8].value;
            }
            if (ok[x - 9]) {
              valorfinal = valorfinal + ok[x - 9].value;
            }
            if (ok[x - 10]) {
              valorfinal = valorfinal + ok[x - 10].value;
            }
            if (ok[x - 11]) {
              valorfinal = valorfinal + ok[x - 11].value;
            }

            ok[x].value = valorfinal;
            array.push(ok[x]);
          }
        }

        cb(null, array);
      }
    );
  };

  Minutes.remoteMethod("StandardReadingsHours", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "variables", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.ConsumptionCostFilter = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    interval,
    cb
  ) {
    if (filter == 0 && interval == 3600) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.ConsumptionCostFilterHours(
        DesignatedMeterId,
        filter,
        start,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }
    if (filter == 1 && interval == 3600) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.ConsumptionCostFilterHours(
        DesignatedMeterId,
        filter,
        start,
        function (err, ok) {
          cb(null, ok);
        }
      );
    }

    if (filter == 2 && interval == 3600) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;

      contador = dias - 1;

      for (contador; contador > 0; contador--) {
        console.log("entre?");
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.ConsumptionCostFilterHours(
          DesignatedMeterId,
          filter,
          start,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        console.log(arreglo);
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }
    if (filter == 3 && interval == 3600) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.ConsumptionCostFilterHours(
          DesignatedMeterId,
          filter,
          start,
          function (err, ok) {
            arreglo.push(ok);
          }
        );
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }
  };

  Minutes.remoteMethod("ConsumptionCostFilter", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "interval", type: "number" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.ConsumptionCostFilter5mins = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    cb
  ) {
    if (filter == 0) {
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = [];
        console.log("entre");
        for (var i in horas) {
          var comparar = horas[i].split(":");
          if (comparar[0] > moment().hour() - 1) {
          } else {
            if (
              moment().hour() - 1 == comparar[0] &&
              comparar[1] > moment().minutes()
            ) {
            } else {
              var fecha = dia.split("/");
              var fechabien =
                fecha[0] +
                fecha[1] +
                fecha[2] +
                comparar[0] +
                comparar[1] +
                "00";
              values = {
                date: fechabien,
                cost: 0,
                consumption: 0,
                rate: "",
                // cambiar null por un parse de date horas[i]
              };

              if (ok[0][horas[i]]) {
                values.consumption = ok[0][horas[i]].EP_IMP_kWh;
              }
              var date = moment(fecha[2] + "-" + fecha[1] + "-" + fecha[0]);

              var hoy = date.day();

              if (hoy == 0) {
                hoy = 7;
              }

              var horasbien = horas[i].split(":");
              // console.log("hora", horas[0]);
              horasbien[0] = parseInt(horasbien[0]);

              if (hoy < 5) {
                // LUNES A VIERNES

                if (horasbien[0] <= 5) {
                  // de 00:00 a 5:59
                  //console.log("base");

                  values.rate = "base";
                  //console.log("valor", valores[i].EP_IMP_kWh);
                }
                if (horasbien[0] >= 6 && horasbien[0] <= 19) {
                  // de 06:00 a 19:59
                  //console.log("intermedio");
                  values.rate = "middle";
                  //console.log("valor", valores[i].EP_IMP_kWh);
                }
                if (horasbien[0] >= 20 && horasbien[0] <= 21) {
                  // de 20:00 a 21:59
                  //console.log("Punta");
                  values.rate = "peak";
                  //console.log("valor", valores[i].EP_IMP_kWh);
                }

                if (horasbien[0] >= 22 && horasbien[0] <= 24) {
                  // de 22:00 a 23:59
                  //console.log("intermedio");
                  values.rate = "middle";
                  // console.log("valor", valores[i].EP_IMP_kWh);
                }
              }
              if (hoy == 6) {
                // SABADOOOOOOOOO
                if (horasbien[0] <= 6) {
                  // de 00:00 a 6:59
                  //console.log("base");
                  values.rate = "base";
                  // console.log("valor", valores[i].EP_IMP_kWh);
                }
                if (horasbien[0] >= 7 && horasbien[0] <= 24) {
                  // de 07:00 a 19:59
                  //console.log("intermedio");
                  values.rate = "middle";
                  //console.log("valor", valores[i].EP_IMP_kWh);
                }
              }
              if (hoy == 7) {
                // Domingo
                if (horasbien[0] <= 18) {
                  // de 00:00 a 18:59
                  //console.log("base");
                  values.rate = "base";
                  // console.log("valor", valores[i].EP_IMP_kWh);
                }
                if (horasbien[0] >= 19 && horasbien[0] <= 24) {
                  // de 07:00 a 19:59
                  // console.log("intermedio");
                  values.rate = "middle";
                  // console.log("valor", valores[i].EP_IMP_kWh);
                }
              }
              var basePrice = 1.103;
              var middlePrice = 2.0062;
              var peakPrice = 2.2633;
              if (values.rate == "middle") {
                values.cost = values.consumption * middlePrice;
              }
              if (values.rate == "base") {
                values.cost = values.consumption * basePrice;
              }
              if (values.rate == "peak") {
                values.cost = values.consumption * peakPrice;
              }

              valores.push(values);
            }
          }
        }
        return cb(null, valores);
      });
    }

    if (filter != 0) {
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = [];
        for (var i in horas) {
          var comparar = horas[i].split(":");

          var fecha = dia.split("/");
          var fechabien =
            fecha[0] + fecha[1] + fecha[2] + comparar[0] + comparar[1] + "00";
          values = {
            date: fechabien,
            cost: 0,
            consumption: 0,
            rate: "",
            // cambiar null por un parse de date horas[i]
          };

          if (ok[0][horas[i]]) {
            values.consumption = ok[0][horas[i]].EP_IMP_kWh;
          }
          var date = moment(fecha[2] + "-" + fecha[1] + "-" + fecha[0]);

          var hoy = date.day();

          if (hoy == 0) {
            hoy = 7;
          }

          var horasbien = horas[i].split(":");
          horasbien[0] = parseInt(horasbien[0]);

          if (hoy < 5) {
            if (horasbien[0] <= 5) {
              // de 00:00 a 5:59
              values.rate = "base";
            }
            if (horasbien[0] >= 6 && horasbien[0] <= 19) {
              // de 06:00 a 19:59
              values.rate = "middle";
            }
            if (horasbien[0] >= 20 && horasbien[0] <= 21) {
              // de 20:00 a 21:59
              values.rate = "peak";
            }

            if (horasbien[0] >= 22 && horasbien[0] <= 24) {
              // de 22:00 a 23:59
              values.rate = "middle";
            }
          }
          if (hoy == 6) {
            // SABADOOOOOOOOO
            if (horasbien[0] <= 6) {
              // de 00:00 a 6:59
              values.rate = "base";
            }
            if (horasbien[0] >= 7 && horasbien[0] <= 24) {
              // de 07:00 a 19:59
              values.rate = "middle";
            }
          }
          if (hoy == 7) {
            // Domingo
            if (horasbien[0] <= 18) {
              // de 00:00 a 18:59
              values.rate = "base";
            }
            if (horasbien[0] >= 19 && horasbien[0] <= 24) {
              // de 07:00 a 19:59
              values.rate = "middle";
            }
          }

          var basePrice = 1.103;
          var middlePrice = 2.0062;
          var peakPrice = 2.2633;
          if (values.rate == "middle") {
            values.cost = values.consumption * middlePrice;
          }
          if (values.rate == "base") {
            values.cost = values.consumption * basePrice;
          }
          if (values.rate == "peak") {
            values.cost = values.consumption * peakPrice;
          }

          valores.push(values);
        }

        return cb(null, valores);
      });
    }
  };

  Minutes.remoteMethod("ConsumptionCostFilter5mins", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.ConsumptionCostFilterHours = function (
    DesignatedMeterId, //idMedidor
    filter, // 0 es hoy 3 es mensual
    dia,
    cb
  ) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.ConsumptionCostFilter5mins(
      DesignatedMeterId,
      filter,
      dia,
      function (err, ok) {
        var array = [];
        for (var x in ok) {
          var resto = x % 12;

          if (resto == 0) {
            var valorfinal = ok[x].consumption;
            var costfinal = ok[x].cost;

            if (ok[x - 1]) {
              valorfinal = valorfinal + ok[x - 1].consumption;
              costfinal = costfinal + ok[x - 1].cost;
            }
            if (ok[x - 2]) {
              valorfinal = valorfinal + ok[x - 2].consumption;
              costfinal = costfinal + ok[x - 2].cost;
            }
            if (ok[x - 3]) {
              valorfinal = valorfinal + ok[x - 3].consumption;
              costfinal = costfinal + ok[x - 3].cost;
            }
            if (ok[x - 4]) {
              valorfinal = valorfinal + ok[x - 4].consumption;
              costfinal = costfinal + ok[x - 4].cost;
            }
            if (ok[x - 5]) {
              valorfinal = valorfinal + ok[x - 5].consumption;
              costfinal = costfinal + ok[x - 5].cost;
            }
            if (ok[x - 6]) {
              valorfinal = valorfinal + ok[x - 6].consumption;
              costfinal = costfinal + ok[x - 6].cost;
            }
            if (ok[x - 7]) {
              valorfinal = valorfinal + ok[x - 7].consumption;
              costfinal = costfinal + ok[x - 7].cost;
            }
            if (ok[x - 8]) {
              valorfinal = valorfinal + ok[x - 8].consumption;
              costfinal = costfinal + ok[x - 8].cost;
            }
            if (ok[x - 9]) {
              valorfinal = valorfinal + ok[x - 9].consumption;
              costfinal = costfinal + ok[x - 9].cost;
            }
            if (ok[x - 10]) {
              valorfinal = valorfinal + ok[x - 10].consumption;
              costfinal = costfinal + ok[x - 10].cost;
            }
            if (ok[x - 11]) {
              valorfinal = valorfinal + ok[x - 11].consumption;
              costfinal = costfinal + ok[x - 11].cost;
            }

            ok[x].consumption = valorfinal;
            ok[x].cost = costfinal;
            array.push(ok[x]);
          }
        }

        cb(null, array);
      }
    );
  };

  Minutes.remoteMethod("ConsumptionCostFilterHours", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.CostRate = function (
    DesignatedMeterId,
    horas,
    consumption,
    dia,
    costos,
    cb
  ) {
    let startOfMonth = moment().startOf("month");
    let date = moment(startOfMonth).tz("America/Mexico_City");
    let new_date = date.clone().startOf("month").format();
    let AdminValue = app.loopback.getModel("AdminValue");
    AdminValue.findByDate(new_date, "Jalisco", (err, res) => {
      console.log(res);
    });
  };

  Minutes.remoteMethod("CostRate", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "horas", type: "string" },
      { arg: "consumption", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "costos", type: "object" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.CostRate = function (
    DesignatedMeterId,
    horas,
    consumption,
    dia,
    costos,
    cb
  ) {
    let startOfMonth = moment().startOf("month");
    let date = moment(startOfMonth).tz("America/Mexico_City");
    let new_date = date.clone().startOf("month").format();
    let AdminValue = app.loopback.getModel("AdminValue");
    AdminValue.findByDate(new_date, "Jalisco", (err, res) => {
      console.log(res);
    });
  };

  Minutes.remoteMethod("CostRate", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "horas", type: "string" },
      { arg: "consumption", type: "number" },
      { arg: "dia", type: "string" },
      { arg: "costos", type: "object" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.FootprintGraph = function (DesignatedMeterId, filter, cb) {
    console.log(DesignatedMeterId, filter);

    if (filter == 0) {
      var start = moment().format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha);
      const Minutesss = app.loopback.getModel("Minutes");
      Minutesss.FootprintHour(DesignatedMeterId, filter, start, function (
        err,
        ok
      ) {
        cb(null, ok);
      });
    }
    if (filter == 1) {
      var start = moment().subtract(1, "days").format("L");
      console.log(start);
      var fecha = start.split("/");
      console.log(fecha[0]);
      const Minutesss = app.loopback.getModel("Minutes");

      Minutesss.FootprintHour(DesignatedMeterId, filter, start, function (
        err,
        ok
      ) {
        cb(null, ok);
      });
    }
    if (filter == 2) {
      var dias = moment().day();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;

      contador = dias - 1;

      for (contador; contador > 0; contador--) {
        console.log("entre?");
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.FootprintHour(DesignatedMeterId, filter, start, function (
          err,
          ok
        ) {
          arreglo.push(ok);
        });
      }

      setTimeout(function () {
        console.log(arreglo);
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        console.log(array);
        return cb(null, array);
      }, 2500);
    }

    if (filter == 3) {
      var dias = moment().date();
      console.log(dias);
      if (dias == 0) {
        dias = 7;
      }
      var array = [];
      var arreglo = [];
      var contador = 0;
      contador = dias - 1;
      for (contador; contador > 0; contador--) {
        // poner = al lado de 0 para agregar el dia actual (se necesitara definir filter 0 para el dia actual)
        var start = moment().subtract(contador, "days").format("L");
        console.log(start);
        const Minutesss = app.loopback.getModel("Minutes");
        Minutesss.FootprintHour(DesignatedMeterId, filter, start, function (
          err,
          ok
        ) {
          arreglo.push(ok);
        });
      }

      setTimeout(function () {
        for (var valor in arreglo) {
          for (var bien in arreglo[valor]) {
            array.push(arreglo[valor][bien]);
          }
        }
        return cb(null, array);
      }, 2500);
    }
  };

  Minutes.remoteMethod("FootprintGraph", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.Footprint5min = function (DesignatedMeterId, filter, dia, cb) {
    if (filter == 0) {
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = [];
        for (var i in horas) {
          var comparar = horas[i].split(":");
          if (comparar[0] > moment().hour() - 1) {
          } else {
            if (
              moment().hour() - 1 == comparar[0] &&
              comparar[1] > moment().minutes()
            ) {
            } else {
              var fecha = dia.split("/");
              var fechabien =
                fecha[0] +
                fecha[1] +
                fecha[2] +
                comparar[0] +
                comparar[1] +
                "00";
              values = {
                date: fechabien,
                co2e: 0,
              };
              if (ok[0]) {
                if (ok[0][horas[i]]) {
                  console.log(ok[0][horas[i]]);
                  values.co2e = (
                    Constants.CFE.values.charge_factor *
                    (ok[0][horas[i]].EP_IMP_kWh / 1000)
                  ).toFixed(4);
                  values.co2e = parseFloat(values.co2e);
                }
              }

              valores.push(values);
            }
          }
        }

        return cb(null, valores);
      });
    }

    if (filter != 0) {
      const Minutessss = app.loopback.getModel("Minutes");
      Minutessss.find({
        where: {
          Dia: dia,
          DesignatedMeterId: DesignatedMeterId,
        },
      }).then((ok) => {
        let values = {};
        let valores = [];
        console.log("entre");
        for (var i in horas) {
          var comparar = horas[i].split(":");

          var fecha = dia.split("/");
          var fechabien =
            fecha[0] + fecha[1] + fecha[2] + comparar[0] + comparar[1] + "00";
          values = {
            date: fechabien,
            co2e: 0,
          };
          if (ok[0]) {
            if (ok[0][horas[i]]) {
              values.co2e = (
                Constants.CFE.values.charge_factor *
                (ok[0][horas[i]].EP_IMP_kWh / 1000)
              ).toFixed(4);

              values.co2e = parseFloat(values.co2e);
            }
          }

          valores.push(values);
        }
        console.log(valores);

        return cb(null, valores);
      });
    }
  };

  Minutes.remoteMethod("Footprint5min", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.FootprintHour = function (DesignatedMeterId, filter, dia, cb) {
    const Minutessss = app.loopback.getModel("Minutes");

    Minutessss.Footprint5min(DesignatedMeterId, filter, dia, function (
      err,
      ok
    ) {
      var array = [];
      for (var x in ok) {
        var resto = x % 12;

        if (resto == 0) {
          var valorfinal = ok[x].co2e;

          if (ok[x - 1]) {
            valorfinal = valorfinal + ok[x - 1].co2e;
          }
          if (ok[x - 2]) {
            valorfinal = valorfinal + ok[x - 2].co2e;
          }
          if (ok[x - 3]) {
            valorfinal = valorfinal + ok[x - 3].co2e;
          }
          if (ok[x - 4]) {
            valorfinal = valorfinal + ok[x - 4].co2e;
          }
          if (ok[x - 5]) {
            valorfinal = valorfinal + ok[x - 5].co2e;
          }
          if (ok[x - 6]) {
            valorfinal = valorfinal + ok[x - 6].co2e;
          }
          if (ok[x - 7]) {
            valorfinal = valorfinal + ok[x - 7].co2e;
          }
          if (ok[x - 8]) {
            valorfinal = valorfinal + ok[x - 8].co2e;
          }
          if (ok[x - 9]) {
            valorfinal = valorfinal + ok[x - 9].co2e;
          }
          if (ok[x - 10]) {
            valorfinal = valorfinal + ok[x - 10].co2e;
          }
          if (ok[x - 11]) {
            valorfinal = valorfinal + ok[x - 11].co2e;
          }

          ok[x].co2e = valorfinal;
          array.push(ok[x]);
        }
      }

      cb(null, array);
    });
  };

  Minutes.remoteMethod("FootprintHour", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "filter", type: "number" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.getCarbonFootprint = function (DesignatedMeterId, cb) {
    const Minutessss = app.loopback.getModel("Minutes");

    var start = moment().format("L");
    Minutessss.VariablesMedidorUltimaHora(start, DesignatedMeterId, function (
      err,
      ok
    ) {
      Minutessss.FootprintHour(DesignatedMeterId, 0, start, function (
        err,
        horas
      ) {
        let Respuesta = {};
        Respuesta.cO2Emissions = 0;

        for (var i in horas) {
          Respuesta.cO2Emissions = Respuesta.cO2Emissions + horas[i].co2e;
        }
        Respuesta.generation = ok.EP_EXP_kWh; //ok.EP_GEN_kWh; // TODO
        Respuesta.consumption = ok.EP_IMP_kWh;
        Respuesta.total = Respuesta.consumption - Respuesta.generation;
        Respuesta.emissionFactor = Constants.CFE.values.emission_factor;
        Respuesta.co2Limit = 25000;
        return cb(null, Respuesta);
      });
    });
  };

  Minutes.remoteMethod("getCarbonFootprint", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.HistorialDeMediciones = function (DesignatedMeterId, cb) {
    DesignatedMeter.findOne({ where: { id: DesignatedMeterId } }).then(
      (Designado) => {
        Company.findOne({ where: { id: Designado.company_id } }).then(
          (company) => {
            let startOfMonth = moment().startOf("month");
            let date = moment(startOfMonth).tz("America/Mexico_City");
            let new_date = date.clone().startOf("month").format();
            let AdminValue = app.loopback.getModel("AdminValue");

            AdminValue.findByDate(new_date, company.Division, function (
              err,
              bien
            ) {
              console.log(bien);
            });
          }
        );
      }
    );

    /*


    */
  };

  Minutes.remoteMethod("HistorialDeMediciones", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.DashboardInfo = function (DesignatedMeterId, cb) {
    DesignatedMeter.findOne({ where: { id: DesignatedMeterId } }).then(
      (Designado) => {
        Company.findOne({ where: { id: Designado.company_id } }).then(
          (company) => {
            let startOfMonth = moment().startOf("month");
            let date = moment(startOfMonth).tz("America/Mexico_City");
            let new_date = date.clone().startOf("month").format();
            let AdminValue = app.loopback.getModel("AdminValue");

            AdminValue.findByDate(new_date, company.Division, function (
              err,
              Datos
            ) {
              let object = {};
              object.Mes = {};
              object.Dia = {};
              if (company.tariff_type == "GDMTH") {
                let tarifa = Datos.GDMTH;
                const Minutesss = app.loopback.getModel("Minutes");

                Minutesss.BaseMediaPuntaMes(
                  DesignatedMeterId,
                  Designado.company_id,
                  function (error, CostoMes) {
                    object.Mes.ConsumoCosto = CostoMes.CostoConsumo;
                    object.Mes.InyeccionCosto = CostoMes.inyeccionCosto;
                    object.Mes.CostoCapacidad = CostoMes.CostoCapacidad;
                    object.Mes.Capacidad = CostoMes.Capacidad;

                    Minutesss.Demanda(
                      DesignatedMeterId,
                      3,
                      Designado.company_id,
                      function (error, Demanda) {
                        object.Mes.Demanda = Demanda;
                        Minutesss.VariablesMensual(DesignatedMeterId, function (
                          err,
                          variablesMensuales
                        ) {
                          object.Mes.Consumo = variablesMensuales.EP_IMP_kWh;
                          object.Mes.Inyeccion = variablesMensuales.EP_EXP_kWh;

                          Minutesss.DistributionPeriod(
                            DesignatedMeterId,
                            3,
                            Designado.company_id,
                            function (err, Distribution) {
                              object.Mes.Distribution = parseFloat(
                                Distribution.value
                              );
                              object.Mes.DistributionCost = parseFloat(
                                Distribution.cost
                              );

                              Minutesss.DistributionPeriodDiario(
                                DesignatedMeterId,
                                3,
                                Designado.company_id,
                                function (error, Datos) {
                                  object.Dia.Distribution = Datos.value;
                                  object.Dia.DistributionCost = Datos.cost;
                                  var start = moment().format("L");

                                  Minutesss.BaseMediaPuntaDia(
                                    start,
                                    DesignatedMeterId,
                                    Designado.company_id,
                                    function (error, DatosDiarios) {
                                      object.Dia.Capacidad =
                                        DatosDiarios.Capacidad;
                                      object.Dia.CapacidadCosto =
                                        DatosDiarios.CapacidadCosto;
                                      object.Dia.CostoConsumo =
                                        DatosDiarios.CostoConsumo;

                                      Minutesss.VariablesMedidorUltimaHora(
                                        start,
                                        DesignatedMeterId,
                                        function (eeror, okas) {
                                          console.log(okas);
                                          console.log(object);
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        });
                      }
                    );
                  }
                );
              }
            });
          }
        );
      }
    );

    /*


    */
  };

  Minutes.remoteMethod("DashboardInfo", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.EficienciaMensual = function (DesignatedMeterId, dia, cb) {
    DesignatedMeter.findOne({
      where: { id: DesignatedMeterId },
    }).then((Designado) => {});
  };

  Minutes.remoteMethod("EficienciaMensual", {
    accepts: [{ arg: "DesignatedMeterId", type: "string" }],

    returns: {
      arg: "response",
      type: "array",
    },
  });

  Minutes.EficienciaDiario = function (DesignatedMeterId, dia, cb) {
    DesignatedMeter.findOne({
      where: { id: DesignatedMeterId },
    }).then((Designado) => {
      const Minutesss = app.loopback.getModel("Minutes");

      let object = {};
      object.Dia = {};
      object.Mes = {};
      Minutesss.BaseMediaPuntaDia(
        dia,
        DesignatedMeterId,
        Designado.company_id,
        function (error, DatosDiarios) {
          object.Dia.CostoConsumo = parseFloat(DatosDiarios.CostoConsumo);

          Minutesss.VariablesMedidorUltimaHora(
            dia,
            DesignatedMeterId,
            function (eeror, datos) {
              object.Dia.Consumo = datos.EP_IMP_kWh;
              object.Dia.Demanda = datos.DMD_P_kW;

              Minutesss.BaseMediaPuntaMes(
                DesignatedMeterId,
                Designado.company_id,
                function (error, CostoMes) {
                  object.Mes.ConsumoCosto = CostoMes.CostoConsumo;
                  object.Mes.CostoCapacidad = CostoMes.CostoCapacidad;
                  object.Mes.Capacidad = CostoMes.Capacidad;

                  Minutesss.Demanda(
                    DesignatedMeterId,
                    3,
                    Designado.company_id,
                    function (error, Demanda) {
                      object.Mes.Demanda = Demanda;
                      Minutesss.VariablesMensual(DesignatedMeterId, function (
                        err,
                        variablesMensuales
                      ) {
                        object.Mes.Consumo = variablesMensuales.EP_IMP_kWh;

                        Minutesss.DistributionPeriod(
                          DesignatedMeterId,
                          3,
                          Designado.company_id,
                          function (err, Distribution) {
                            object.Mes.DistributionCost = parseFloat(
                              Distribution.cost
                            );
                            return cb(null, object);
                          }
                        );
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  };

  Minutes.remoteMethod("EficienciaDiario", {
    accepts: [
      { arg: "DesignatedMeterId", type: "string" },
      { arg: "dia", type: "string" },
    ],

    returns: {
      arg: "response",
      type: "array",
    },
  });
};
