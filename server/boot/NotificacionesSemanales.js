const app = require('../server');
const notificaciones = app
    .loopback
    .getModel('notificaciones');
const User = app
    .loopback
    .getModel('eUser');
const service = app
    .loopback
    .getModel('Service');

const designatedMeter = app.models.DesignatedMeter
const Meter = app.models.Meter

var lista_costosDeDevices = [];
var listafinal = [];
var cron = require('node-cron');
var p = -1;
var lista_costosDeDevices2 = [];
var lista_costosDeDevices = [];
var listafinal = [];
var CompaniesID = [];

let Mandando_a_Llamar = cron.schedule('  0 9 * * 1',
// Segun GuruCrontab  => At 09:00 on Monday.
() => {
    p = -1;
    Iniciando_secuencia();

    Mandando_a_Llamar.stop();
})

function Iniciando_secuencia() {

    let ok = cron.schedule(' 30,59 * * * * *', () => {

        designatedMeter.find({}, function (err, servuce) {

            if (p == servuce.length) {
                axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["Agrofesam"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - Agrofesam"}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );


                  axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["Agroindustria Gara"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - Agroindustria Gara"}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );
                  
                  axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["Deliseos"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - Deliseos "}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );

                  axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["Pureplastic"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - Pureplastic "}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );

                  
                  
                  axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["Samfrut"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - Samfrut "}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );

                  axios.post('https://onesignal.com/api/v1/notifications',{
                    "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
                    "included_segments": ["TecnoFruit"],
                    "data": {"foo": "bar"},
                    "template_id": "8db1414c-8b29-44a3-89b2-1c36f991a14d",
                    "contents": {"en": "Listo!Ingresa a la app para saber cual fue el consumo y generacion de energia que tuviste el dia de ayer "},
                    "headings": {"en" : "Costos diarios - TecnoFruit "}
                  },
                  {headers: {
                      'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
                      'Content-Type': 'application/json; charset=utf-8'
                  }} );
                console.log('se terminaron de hacer las notificaciones')
                ok.stop()
            } else {
                IniciarNotificaciones(servuce.length);
            }
        })

    });
}

function IniciarNotificaciones(y) {

    let inicio = cron.schedule(' 7,14,24,35,40,59 * * * * *', () => {

        if (p != y - 1) {

            designatedMeter
                .find({
                    include: {
                        relation: 'meter',
                        relation: 'services' // include the owner object
                    }
                })
                .then(Info => {

                    var Infos = Info[p].toJSON();
       
                    CompaniesID.push(Info[p].company_id)
             




                    Infos
                        .devices
                        .forEach(Devices => {

                            Meter.getConsumptionCostsByFilter(Infos.meter_id, // id del meter
                                    Devices.name, //Por cada dispositivo
                                    "", 2, 3600, "", function (err, Meter) {
                                var costo_total = []
                                for (x in Meter) { // por cada resultado meter el costo en un arreglo
                                    costo_total.push(Meter[x].cost)
                                }
                                Costo_Dispositivo = costo_total
                                    .reduce((a, b) => a + b, 0) //Sumando los valores
                                    .toFixed(2) //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
                                lista_costosDeDevices.push(
                                    Devices.name + ' ' + Costo_Dispositivo
                                ) //Añadiendolos a un array para futuro uso
                                listafinal = Infos.company_id // si esta imprimiendo los datos

                            });

                        });

                    Infos
                        .services   
                        .forEach(service => {
                            Meter.getConsumptionCostsByFilter(Infos.meter_id, // id del meter
                                    "", //Por cada dispositivo
                                    service.serviceName, 2, 3600, "", function (err, Metor) {
                                costo_total = [];
                                for (x in Metor) { // por cada resultado meter el costo en un arreglo
                                    costo_total.push(Metor[x].cost)
                                }
                                Costo_Dispositivo = costo_total
                                    .reduce((a, b) => a + b, 0) //Sumando los valores
                                    .toFixed(2) //redondearlo a dos punto  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") Mostrarlo de manera bonita
                                lista_costosDeDevices2.push(
                                    service.serviceName + ' ' + Costo_Dispositivo
                                ) //Añadiendolos a un array para futuro uso
                                listafinal2 = Infos.company_id // si esta imprimiendo los datos

                            })

                        })

                    if (lista_costosDeDevices != '') { // Creando notificaciones

                        Dispositivos = lista_costosDeDevices
                        Servicios = lista_costosDeDevices2
                        var Fecha = Date.now();
                        User
                            .find({
                                where: {
                                    company_id: CompaniesID[p - 1]
                                }
                            })
                            .then(users => {
                                notificaciones.create([
                                    {
                                        "Dispositivos": Dispositivos,
                                        "Servicios": Servicios,
                                        "company_id": CompaniesID[p - 1],
                                        "tipo": "Semanal",
                                        "En_Correo": false,
                                        "Fecha": Fecha,
                                        "usuarios": users
                                    }
                                ], function () {
                                    console.log('Creando notificacion en Api')
                                }) //Creando notificacion

                            })

                        lista_costosDeDevices = [];
                        lista_costosDeDevices2 = []
                    }

                });

            p = p + 1;

            inicio.stop()

        } else {

            Dispositivos = lista_costosDeDevices
            Servicios = lista_costosDeDevices2
            var Fecha = Date.now();
            User
                .find({
                    where: {
                        company_id: listafinal
                    }
                })
                .then(users => {
                    notificaciones.create([
                        {
                            "Dispositivos": Dispositivos,
                            "Servicios": Servicios,
                            "company_id": listafinal,
                            "tipo": "Semanal",
                            "En_Correo": false,
                            "Fecha": Fecha,
                            "usuarios": users
                        }
                    ], function () {
                        console.log('Creando notificacion en Api')
                    }) //Creando notificacion

                })
            p = p + 1

            inicio.stop();

            lista_costosDeDevices = [];
            lista_costosDeDevices2 = []

        }

    })

}