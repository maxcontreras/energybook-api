const app = require("../server");
const notificaciones = app.loopback.getModel("notificaciones");
const User = app.loopback.getModel("eUser");
const service = app.loopback.getModel("Service");
var axios = require("axios");

const designatedMeter = app.models.DesignatedMeter;
const Meter = app.models.Meter;
var lista_costosDeDevices = [];
var lista_CostoDeServicios = [];

var lista_DemandaDispositivos = [];
var lista_DemandaDeServicios = [];

var lista_EpimpDispositivos = [];
var lista_EpimpServicios = [];
var MostrarServicio1Valor = [];
var filter = 3;

var cron = require("node-cron");
cron.schedule(
  // 5 45 AM LUNES A VIERNES
  "20 11 1 1-12 *",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    designatedMeter
      .findOne({
        where: {
          id: "5c2e8465ddd3421cf9a48b38",
        },
        include: {
          relation: "meter",
          relation: "services", // include the owner object
        },
      })
      .then((Info) => {

        const T1  = Info.devices[1].description
        const T2 = Info.devices[2].description
        const T3 = Info.devices[3].description   


        Meter.getConsumptionCostsByFilter(
          "5bf6ef89db55ec4a265b3179", // id del meter
          "T1", //Por cada dispositivo
          "",
          filter,
          3600,
          "",
          function (err, Meter) {
            if (Meter) {
              var costo_total = [];

              for (x in Meter) {
                // por cada resultado meter el costo en un arreglo
                costo_total.push(Meter[x].cost);
              }
              var Costo_Dispositivo = costo_total
                .reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita

              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);

              lista_costosDeDevices.push(T1 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso
        
            } else if (err) {
              console.log(err);
            }
          }
        );

     
        setTimeout(() => {
          Meter.getConsumptionCostsByFilter(
            "5bf6ef89db55ec4a265b3179", // id del meter
            "T2", //Por cada dispositivo
            "",
            filter,
            3600,
            "",
            function (err, Meter) {
              if (Meter) {
                var costo_total = [];

                for (x in Meter) {
                  // por cada resultado meter el costo en un arreglo
                  costo_total.push(Meter[x].cost);
                }
                var Costo_Dispositivo = costo_total
                  .reduce((a, b) => a + b, 0) //Sumando los valores
                  .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita

                var formatter = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                });
                var Costo_Dispositivo = formatter.format(Costo_Dispositivo);

                lista_costosDeDevices.push(T2 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso
           
              } else if (err) {
                console.log(err);
              }
            }
          );
        }, 5000);

        setTimeout(() => {
          Meter.getConsumptionCostsByFilter(
            "5bf6ef89db55ec4a265b3179", // id del meter
            "T3", //Por cada dispositivo
            "",
            filter,
            3600,
            "",
            function (err, Meter) {
              if (Meter) {
                var costo_total = [];

                for (x in Meter) {
                  // por cada resultado meter el costo en un arreglo
                  costo_total.push(Meter[x].cost);
                }
                var Costo_Dispositivo = costo_total
                  .reduce((a, b) => a + b, 0) //Sumando los valores
                  .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
                var formatter = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                });
                var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
                lista_costosDeDevices.push(T3 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

            
              } else if (err) {
                console.log(err);
              }
            }
          );
        }, 10000);

        // AHORA LO HAREMOS POR SERVICIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

        setTimeout(() => {
          Meter.getConsumptionCostsByFilter(
            "5bf6ef89db55ec4a265b3179", // id del meter
            "", //Por cada dispositivo
            "Servicio 1",
            filter,
            3600,
            "",
            function (err, Meter) {
              if (Meter) {
                var costo_total = [];

                for (x in Meter) {
                  // por cada resultado meter el costo en un arreglo
                  costo_total.push(Meter[x].cost);
                }
                var Costo_Dispositivo = costo_total
                  .reduce((a, b) => a + b, 0) //Sumando los valores
                  .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
                var formatter = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                });
                var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
                lista_CostoDeServicios.push(
                  "servicio 1" + " " + Costo_Dispositivo
                ); //Añadiendolos a un array para futuro uso
           
              } else if (err) {
                console.log(err);
              }
            }
          );
        }, 15000);

        setTimeout(() => {
          Fecha = Date.now();
          User.find({
            where: {
              company_id: Info.company_id,
            },
          }).then((users) => {
            notificaciones.create(
              [
                {
                  Dispositivos: lista_costosDeDevices,
                  Servicios: lista_CostoDeServicios,
                  company_id: Info.company_id,
                  tipo: "Costo",
                  intervalo: "Mensual",
                  Descripcion:
                    "Resumen del costo de energia de tus dispositivos.",
                  En_Correo: false,
                  Fecha: Fecha,
                  usuarios: users,
                },
              ],
              function () {
                console.log("Creando notificacion en Api de COSTO");
              }
            ); //Creando notificacion
          });
        }, 22000);

        // INICIANDO DEMANDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T1",
            "",
            "DP",
            filter,
            3600,
            {},
            (err, res) => {
              console.log(" INICIANDO NOTIFICACION TIPO  DEMANDA ");

              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_DemandaDispositivos.push(T1 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

            
            }
          );
        }, 27000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T2",
            "",
            "DP",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_DemandaDispositivos.push(T2 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

             
            }
          );
        }, 30000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T3",
            "",
            "DP",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_DemandaDispositivos.push(T3 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

            
            }
          );
        }, 34000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "",
            "Servicio 1",
            "DP",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_DemandaDeServicios.push(
                "Servicio 1" + " " + Costo_Dispositivo
              ); //Añadiendolos a un array para futuro uso

            
            }
          );
        }, 37000);

        setTimeout(() => {
          Fecha = Date.now();
          User.find({
            where: {
              company_id: Info.company_id,
            },
          }).then((users) => {
            notificaciones.create(
              [
                {
                  Dispositivos: lista_DemandaDispositivos,
                  Servicios: lista_DemandaDeServicios,
                  company_id: Info.company_id,
                  tipo: "Demanda",
                  intervalo: "Mensual",
                  Descripcion:
                    "Resumen de la demanda de energia de tus dispositivos.",
                  En_Correo: false,
                  Fecha: Fecha,
                  usuarios: users,
                },
              ],
              function () {
                console.log("Creando notificacion en Api de DEMANDA DIARIA");
              }
            ); //Creando notificacion
          });
        }, 46000);

        // INICIANDO                             CONUSMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T1",
            "",
            "EPimp",
            filter,
            3600,
            {},
            (err, res) => {
              console.log(" INICIANDO NOTIFICACION TIPO  CONSUMO ");

              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_EpimpDispositivos.push(T1 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

          
            }
          );
        }, 50000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T2",
            "",
            "EPimp",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_EpimpDispositivos.push(T2 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

           
            }
          );
        }, 53000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "T3",
            "",
            "EPimp",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              lista_EpimpDispositivos.push(T3 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

             
            }
          );
        }, 56000);

        setTimeout(() => {
          let suma = 0;
          Meter.standardReadings(
            "5bf6ef89db55ec4a265b3179",
            "",
            "Servicio 1",
            "EPimp",
            filter,
            3600,
            {},
            (err, res) => {
              var DemandaTotal = [];

              for (x in res) {
                // por cada resultado meter el costo en un arreglo
                DemandaTotal.push(res[x].value);
              }

              var Costo_Dispositivo = DemandaTotal.reduce((a, b) => a + b, 0) //Sumando los valores
                .toFixed(2); //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
              var formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              });
              var Costo_Dispositivo = formatter.format(Costo_Dispositivo);
              MostrarServicio1Valor = Costo_Dispositivo;
           
              lista_EpimpServicios.push("Servicio 1" + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

           
            }
          );
        }, 60000);

        setTimeout(() => {
          Fecha = Date.now();
          User.find({
            where: {
              company_id: Info.company_id,
            },
          }).then((users) => {
            notificaciones.create(
              [
                {
                  Dispositivos: lista_EpimpDispositivos,
                  Servicios: lista_EpimpServicios,
                  company_id: Info.company_id,
                  tipo: "EPIMP",
                  intervalo: "Mensual",
                  Descripcion:
                    "Resumen del consumo de energia de tus dispositivos.",
                  En_Correo: false,
                  Fecha: Fecha,
                  usuarios: users,
                },
              ],
              function () {
                console.log("Creando notificacion en Api de EPIMP DIARIA");
              }
            ); //Creando notificacion
          });
        }, 68000);

        setTimeout(() => {
          axios
            .post(
              "https://onesignal.com/api/v1/notifications",
              {
                app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
                included_segments: ["TecnoFruit"],
                data: { foo: "bar" },
                template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                contents: {
                  en:
                    "El costo del consumo mensual del servicio 1 fue de " +
                    MostrarServicio1Valor.toString() +
                    ".",
                },
                headings: { en: "Costos Mensuales - TecnoFruit " },
              },
              {
                headers: {
                  Authorization:
                    "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
                  "Content-Type": "application/json; charset=utf-8",
                },
              }
            )
            .then((response) => {
              console.log(response);
            });
        }, 75000);

        setTimeout(() => {
          lista_costosDeDevices = [];
          lista_CostoDeServicios = [];
          lista_DemandaDispositivos = [];
          lista_DemandaDeServicios = [];
          lista_EpimpDispositivos = [];
          lista_EpimpServicios = [];
          MostrarServicio1Valor = [];
        }, 85000);
      });
  }
);
