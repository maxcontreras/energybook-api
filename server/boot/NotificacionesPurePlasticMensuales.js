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
var MostrarServicio2Valor = [];
var filter = 3;

const moment = require("moment-timezone");
moment.locale('es')
moment.tz.setDefault("America/Mexico_City");

var cron = require("node-cron");
cron.schedule("40 10 1 1-12 *", () => {
  designatedMeter
    .findOne({
      where: {
        id: "5bc502851521d56a23ccac92",
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
      const T4  = Info.devices[5].description
      const T5 =  Info.devices[4].description


      Meter.getConsumptionCostsByFilter(
        "5bb8fd821b25d76067e2d4f8", // id del meter
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
          "5bb8fd821b25d76067e2d4f8", // id del meter
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
          "5bb8fd821b25d76067e2d4f8", // id del meter
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

      setTimeout(() => {
        Meter.getConsumptionCostsByFilter(
          "5bb8fd821b25d76067e2d4f8", // id del meter
          "T4", //Por cada dispositivo
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
              lista_costosDeDevices.push(T4 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

        
            } else if (err) {
              console.log(err);
            }
          }
        );
      }, 15000);

      setTimeout(() => {
        Meter.getConsumptionCostsByFilter(
          "5bb8fd821b25d76067e2d4f8", // id del meter
          "T5", //Por cada dispositivo
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
              lista_costosDeDevices.push(T5 + " " + Costo_Dispositivo); //Añadiendolos a un array para futuro uso

            
            } else if (err) {
              console.log(err);
            }
          }
        );
      }, 20000);

      // AHORA LO HAREMOS POR SERVICIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

      setTimeout(() => {
        Meter.getConsumptionCostsByFilter(
          "5bb8fd821b25d76067e2d4f8", // id del meter
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

              MostrarServicio1Valor = Costo_Dispositivo;
             
            } else if (err) {
              console.log(err);
            }
          }
        );
      }, 25000);

      setTimeout(() => {
        Meter.getConsumptionCostsByFilter(
          "5bb8fd821b25d76067e2d4f8", // id del meter
          "", //Por cada dispositivo
          "Servicio 2",
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
                "servicio 2" + " " + Costo_Dispositivo
              ); //Añadiendolos a un array para futuro uso

              MostrarServicio2Valor = Costo_Dispositivo;
             
            } else if (err) {
              console.log(err);
            }
          }
        );
      }, 27000);

      ///////////////////////////////////

      setTimeout(() => {
        var Fecha = moment().format('L') + " " + moment().format('LTS')
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
                Descripcion:
                  "Resumen del costo de energia de tus dispositivos.",
                intervalo: "Mensual",
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
      }, 30000);

      // INICIANDO DEMANDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)

            lista_DemandaDispositivos.push(
              T1 + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

         
          }
        );
      }, 34000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)
            lista_DemandaDispositivos.push(
              T2 + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

       
          }
        );
      }, 39000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)

            lista_DemandaDispositivos.push(
              T3 + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

         
          }
        );
      }, 42000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "T4",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)

            lista_DemandaDispositivos.push(
              T4 + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

          
          }
        );
      }, 47000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "T5",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)

            lista_DemandaDispositivos.push(
              T5 + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

          
          }
        );
      }, 49000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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
            var  Costo_Dispositivo =  Math.max(...DemandaTotal)
            lista_DemandaDeServicios.push(
              "Servicio 1" + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

        
          }
        );
      }, 53000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "",
          "Servicio 2",
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

            var  Costo_Dispositivo =  Math.max(...DemandaTotal)
            lista_DemandaDeServicios.push(
              "Servicio 2" + " " + Costo_Dispositivo + " kW"
            ); //Añadiendolos a un array para futuro uso

         
          }
        );
      }, 53000);

      setTimeout(() => {
        var Fecha = moment().format('L') + " " + moment().format('LTS')
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
                Descripcion:
                  "Resumen de la demanda de energia de tus dispositivos.",
                intervalo: "Mensual",
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
      }, 56000);

      // EPIMP---------------------------------------------------------------------------------------------------------------------------------

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Mostrarlo de manera bonita

            lista_EpimpDispositivos.push(
              T1 + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

       
          }
        );
      }, 59000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Mostrarlo de manera bonita
            lista_EpimpDispositivos.push(
              T2 + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

          
          }
        );
      }, 63000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            lista_EpimpDispositivos.push(
              T3 + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

           
          }
        );
      }, 66000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "T4",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            lista_EpimpDispositivos.push(
              T4 + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

           
          }
        );
      }, 69000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "T5",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            lista_EpimpDispositivos.push(
              T5 + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

           
          }
        );
      }, 72000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Mostrarlo de manera bonita

            lista_EpimpServicios.push(
              "Servicio 1" + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

          
          }
        );
      }, 75000);

      setTimeout(() => {
        let suma = 0;
        Meter.standardReadings(
          "5bb8fd821b25d76067e2d4f8",
          "",
          "Servicio 2",
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
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Mostrarlo de manera bonita

            lista_EpimpServicios.push(
              "Servicio 2" + " " + Costo_Dispositivo + " kWh"
            ); //Añadiendolos a un array para futuro uso

           
          }
        );
      }, 77000);

      setTimeout(() => {
        var Fecha = moment().format('L') + " " + moment().format('LTS')
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
                tipo: "Consumo",
                Descripcion:
                  "Resumen del consumo de energia de tus dispositivos.",
                intervalo: "Mensual",
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
      }, 80000);

      setTimeout(() => {
        axios
          .post(
            "https://onesignal.com/api/v1/notifications",
            {
              app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
              included_segments: ["Pureplastic"],
              data: { foo: "bar" },
              template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
              contents: {
                en:
                  "El costo del consumo Mensual del servicio 1 fue de " +
                  MostrarServicio1Valor.toString() +
                  " y del servicio 2 fue de " +
                  MostrarServicio2Valor.toString() +
                  ".",
              },
              headings: { en: "Costos Mensuales - Pureplastic " },
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
      }, 90000);

      setTimeout(() => {
        lista_costosDeDevices = [];
        lista_CostoDeServicios = [];
        lista_DemandaDispositivos = [];
        lista_DemandaDeServicios = [];
        lista_EpimpDispositivos = [];
        lista_EpimpServicios = [];
        MostrarServicio1Valor = [];
        MostrarServicio2Valor = [];
      }, 100000);
    });
});
