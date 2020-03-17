/*const app = require('../server');
const notificaciones = app
    .loopback
    .getModel('notificaciones');
const User = app
    .loopback
    .getModel('eUser');
const service = app
    .loopback
    .getModel('Service');
var axios = require('axios');

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

let Mandando_a_Llamar = cron.schedule('1 * * * *',
// Segun GuruCrontab  => At 09:00 Everyday
() => {

    console.log('hola')

    designatedMeter
    .find({
        
            include: {
                relation: 'meter',
                relation: 'services' // include the owner object
        }
  
    })
    .then(Info => { 

        

        Info.forEach(Elemento => {
            if(Elemento.company_id == "5b907cbcd03841243407f8c2"){// PurePlastic
                PurePlastic(Elemento);
            }
        });
    

    
    
    });



  
 /*   axios.post('https://onesignal.com/api/v1/notifications',{
        "app_id": "e31f477a-2f06-4f77-b051-376694227a4c",
        "included_segments": ["All"],
        "data": {"foo": "bar"},
        "contents": {"en": "Probando notificacion push, porfavor ignoren"},
        "headings": {"en" : "Probando, Ignoren"}
      },
      {headers: {
          'Authorization': 'Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj',
          'Content-Type': 'application/json; charset=utf-8'
      }}      s
    );
    



 function PurePlastic(Elemento){
        var idPurePlastic = Elemento;
    var json = idPurePlastic.toJSON();

    console.log(json.devices)

    json
    .devices
    .forEach(Devices => {

       Dispositivo(Devices, json.company_id, json.meter_id)
    
    });




console.log('se corre aparte')


    }


    async function Dispositivo(Devices, company_id, meterID){

        console.log(company_id)

        console.log(Devices)

        let promise = Meter.getConsumptionCostsByFilter(meterID, // id del meter
            Devices.name, //Por cada dispositivo
            "", 1, 3600, "");

        let result = await promise
        console.log(result)



         /* Meter.getConsumptionCostsByFilter(json.meter_id, // id del meter
                Devices.name, //Por cada dispositivo
                "", 1, 3600, "", function (err, Meter) {
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
            listafinal = json.company_id // si esta imprimiendo los datos
            
        });
        */

/*
    }




})


*/