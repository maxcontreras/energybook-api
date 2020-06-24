var cron = require("node-cron");
const app = require("../server");
const notificaciones = app.loopback.getModel("notificaciones");
const User = app.loopback.getModel("eUser");
var axios = require("axios");

const moment = require("moment-timezone");
moment.locale('es')
moment.tz.setDefault("America/Mexico_City");



function HacerNotificaciones(){


  
User.find({
}).then((users) => {
  var userspureplastic = []; 
  var usersagrofesam = [];
  var usersagroindustrias = [];
  var TecnoFruit = [];


 users.forEach(usuario => {

  
   if(usuario.company_id == "5b907cbcd03841243407f8c2") // Pureplastic
     
   {
    userspureplastic.push(usuario)
   }
   if( usuario.company_id == "5b8dab8c7ed0dd0c5ba0e133"){ // Agrofesam
   
    usersagrofesam.push(usuario)
  
  }
  
  if( usuario.company_id == "5c2e7e6a51e9f51b9e5de80b"){ //  Agroindustria Gara
    usersagroindustrias.push(usuario)
  } 

  if(usuario.company_id == "5c2e7d9d51e9f51b9e5de809"){// TecnoFruit)
    TecnoFruit.push(usuario)
  } 





  

 })



 var Fecha = moment().format('L') + " " + moment().format('LTS')

 notificaciones.create(
  [
    {
      Dispositivos: ["Error"],
      Servicios: ["Error"],
      company_id: "5b907cbcd03841243407f8c2",
      tipo: "Cambio de horario",
      intervalo: "Error",
      En_Correo: false,
      Descripcion:
      "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
      Fecha: Fecha,
      usuarios: userspureplastic,
    },
  ],
  function () {
    console.log("Creando notificacion de Cambio de horario");
  }
); //Creando notificacion


notificaciones.create(
  [
    {
      Dispositivos: ["Error"],
      Servicios: ["Error"],
      company_id: "5b8dab8c7ed0dd0c5ba0e133",
      tipo: "Cambio de horario",
      intervalo: "Error",
      En_Correo: false,
      Descripcion:
      "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
      Fecha: Fecha,
      usuarios: usersagrofesam,
    },
  ],
  function () {
    console.log("Creando notificacion de Cambio de horario");
  }
); //Creando notificacion


notificaciones.create(
  [
    {
      Dispositivos: ["Error"],
      Servicios: ["Error"],
      company_id: "5c2e7e6a51e9f51b9e5de80b",
      tipo: "Cambio de horario",
      intervalo: "Error",
      En_Correo: false,
      Descripcion:
      "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
      Fecha: Fecha,
      usuarios: usersagroindustrias,
    },
  ],
  function () {
    console.log("Creando notificacion de Cambio de horario");
  }
); //Creando notificacion



notificaciones.create(
  [
    {
      Dispositivos: ["Error"],
      Servicios: ["Error"],
      company_id: "5c2e7d9d51e9f51b9e5de809",
      tipo: "Cambio de horario",
      intervalo: "Error",
      En_Correo: false,
      Descripcion:
      "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
      Fecha: Fecha,
      usuarios: TecnoFruit,
    },
  ],
  function () {
    console.log("Creando notificacion de Cambio de horario");
  }
); //Creando notificacion




  

});
}





cron.schedule(
  // 5 45 AM LUNES A VIERNES
  "45 5 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {

    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic", // 5b907cbcd03841243407f8c2
            "Agrofesam", // 5b8dab8c7ed0dd0c5ba0e133
            "Agroindustria Gara", // 5c2e7e6a51e9f51b9e5de80b
            "Pureplastic", // 5b907cbcd03841243407f8c2
            "TecnoFruit", // 5c2e7d9d51e9f51b9e5de809
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();


      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 19 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 21 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {



    















    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 6 * * 6",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 6",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 19 * * 0",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 0",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
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
        HacerNotificaciones();
      });
  }
);
