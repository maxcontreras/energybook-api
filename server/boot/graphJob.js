 


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
 var cron = require('node-cron');
 var p = -1;
 var CompaniesID = [];
 var Servicios = [];
 var ServiciosresultadoEPimp = [];
 var ServiciosresultadoDP = [];
 var DevicesresultadoDP = [];
 var DevicesresultadoEPimp = [];
 
 let Mandando_a_Llamar = cron.schedule(' 20 9 * * 1', //20 9 * * 1
 // Segun GuruCrontab  => “At 05:00 on day-of-month 1.” // * * * * * *
 () => {
     p = -1;
     Iniciando_secuencia();
 
     Mandando_a_Llamar.stop();
 })
 
 function Iniciando_secuencia() {
 
     let ok = cron.schedule(' 30,59 * * * * *', () => {
 
         designatedMeter.find({}, function (err, servuce) {
            console.log(servuce.length)
             if (p == servuce.length) {
                 
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
                    
                    
                    console.log('es Infos')
                    console.log(Infos)

                    Infos
                     .services
                     .forEach(service => {
                         Meter.standardReadings(Infos.meter_id, '', service.serviceName, "DP", 0, 900, {}, (err, res) => {
                             Servicios.push(service.serviceName)
                             Servicios.push(res)
                            
                             ServiciosresultadoDP[service.serviceName]= res
                         })
                     })
                    

                     Infos
                     .services
                     .forEach(service => {
                         Meter.standardReadings(Infos.meter_id, '', service.serviceName, "EPimp", 0, 900, {}, (err, res) => {
                             Servicios.push(service.serviceName)
                             Servicios.push(res)
                           
                             ServiciosresultadoEPimp[service.serviceName]= res
                    
                            
                         })
                     })


                     Infos
                     .devices
                     .forEach(device => {
                         Meter.standardReadings(Infos.meter_id, device.name, '', "DP", 0, 900, {}, (err, res) => {
                             Servicios.push(service.serviceName)
                             Servicios.push(res)
                           
                            DevicesresultadoDP[service.serviceName]= res
                    
                            
                         })
                     })
                    


                     Infos
                     .devices
                     .forEach(device => {
                         console.log(device.name)
                         Meter.standardReadings(Infos.meter_id, device.name, '', "EPimp", 0, 900, {}, (err, res) => {
                            DevicesresultadoEPimp[device.name]= res
                         })
                     })




                     console.log('Servicios DP')
                     console.log( ServiciosresultadoDP)
                     console.log(' Servicios EPimp')
                     console.log(ServiciosresultadoEPimp)
                     
                     /*----------------------------------------------------*/


                     console.log('Devices Epimp')
                     console.log(DevicesresultadoEPimp)
                     console.log('Devices DP')
                     console.log(DevicesresultadoDP)





















                     if (Servicios != '') { // Creando notificaciones
console.log('se crea un apartado')

                                          }
                     DevicesresultadoEPimp =[];
                     DevicesresultadoDP =[];
                     ServiciosresultadoEPimp = [];
                     ServiciosresultadoDP=[];
                     Servicios = [];
 
                 });
 
             p = p + 1;
 
             inicio.stop()
 
         } else {
 
         
             p = p + 1
 
             inicio.stop();
 
             lista_costosDeDevices = [];
             lista_costosDeDevices2 = []
 
         }
 
     })
 
 }

