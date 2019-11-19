
const CronJob = require('cron').CronJob;
const app = require('./../server');
const notificaciones = app.loopback.getModel('notificaciones');
const users = app.models.eUser
const designatedMeter = app.models.DesignatedMeter
const Meter = app.models.Meter
var nodemailer = require('nodemailer');

//Con el campo de company id del user vas a la tabla de designated meter ves
// cual esta igual, sacas el id de designated meter y 
//ese lo buscas en la tabla service a ver cual es el parecido

const EDS = require('../../server/modules/eds-connector');
var timezone = 'America/Mexico_City';
var lista_devices = [];
var lista_costosDeDevices = [];

var i = -1 
var cron = require('node-cron');
let inicio = cron.schedule('* * * * *', () => { 



 if(i==5 ){
     console.log('se terminaran de hacer las notificaciones por usuario')
    inicio.stop()
 }else{
    IniciarNotificaciones();
 }
});

function IniciarNotificaciones(){  

    let x =cron.schedule(' 5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => { 

 designatedMeter.find({},function(err, designatedmeters){

   console.log( designatedmeters[i].devices)

   designatedmeters[i].devices.forEach(function(device) {  
   Meter.getConsumptionCostsByFilter(designatedmeters[i].meter_id,device.name,"",2,3600,"", function(err, Meter) {
     var costo_total  = [] 
     for(x in Meter){// por cada resultado meter el costo en un arreglo
        costo_total.push(Meter[x].cost)
    }
      Costo_Dispositivo =  costo_total.reduce((a,b)=> a+b,0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") //Mostrarlo de manera bonita
     lista_costosDeDevices.push(device.name +','+ Costo_Dispositivo)  //Añadiendolos a un array para futuro uso
     // si esta imprimiendo los datos necesitas hacer una lista de cada dispositivo y despues una lista de cuanto consumieron o sumar todo 
       }
       )//cerrando consumptios

      })//cerrando devices. 
      console.log(lista_costosDeDevices)
if(lista_costosDeDevices!= ''){


    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
             user: 'pruebacorreoleftright@gmail.com',
             pass: '31255382'
         }
     });
    const mailOptions = {
      from: 'pruebacorreoleftright@gmail.com', // sender address
      to: 'sushipass2@gmail.com', // list of receivers
      subject: 'Notificacion por correo EnergyBook Esta es una prueba', // Subject line
      html: lista_costosDeDevices.toString()// plain text body
    };

   transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log('se mando correo  ');
 });

 notificaciones.create(    [{"mensaje": lista_costosDeDevices,"UserId": userr[y].id}], function(){
  console.log('Creando notificacion en Api')
}) //Creando notificacion



  

   


} 
    lista_costosDeDevices= []
   
   
   
   x.stop();
});

i=i+1;

}
    )}

    function resolveAfter2Seconds() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('resolved');
        }, 2000);
      });
    }


/*

        console.log(num)
        console.log(final)  
// Cuando se manda a llamar esta funcion mandarle un numero que seria el inidicador del id del usuario por lo tanto
        users.find({where: {}},function(err, users){
            if (err){
                console.log('Hubo un error al encontrar ususarios')
            }
               if(users[num].company_id == undefined){
                console.log("este usuario no tiene company id ")   
               } else {
                   // Por cada usuario
       //console.log(users[1])
              // console.log( 'este es tu id de usuario : ' + users[1].id)
               
               var companyid = users[num].company_id
             //  console.log('Id de compañia'+companyid)
       
               designatedMeter.findOne({
                   where: {company_id : companyid}
               }, function(err, designatedMeter) {
              // console.log('Este es mi designated Meter --------------')
       //console.log(designatedMeter.meter_id)
       if(designatedMeter){
           designatedMeter.devices.forEach(function(device) {  
          Meter.getConsumptionCostsByFilter(designatedMeter.meter_id,device.name,"",2,3600,"", function(err, Meter) {
           var costo_total  = [] 
           for(i in Meter){// por cada resultado meter el costo en un arreglo
              costo_total.push(Meter[i].cost)
           }
       
           Costo_Dispositivo =  costo_total.reduce((a,b)=> a+b,0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") //Mostrarlo de manera bonita
           lista_costosDeDevices[device.name]= Costo_Dispositivo              //Añadiendolos a un array para futuro uso
            
           // si esta imprimiendo los datos necesitas hacer una lista de cada dispositivo y despues una lista de cuanto consumieron o sumar todo 
           console.log(lista_costosDeDevices)
     
       
             })//cerrando consumptios
            })//cerrando devices
           }else{
       
           }
       
           }
       
       )

    
                   }
                    }
           );

          
        })

        let my_job = cron.scheduledJobs[Nombre];
        my_job.cancel();
        num=num+1;

        */



