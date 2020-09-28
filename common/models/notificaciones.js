const axios = require("axios");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

module.exports = function (notificaciones) {
  /**
   * Encuentra Notificaciones Por compañia POR DIA!
   * @param {string} Company_id Es el id de la compañia
   * @param {Function(Error, object)} callback
   */

  notificaciones.Company = function (Company_id, callback) {
    //EncuentraNotificacionesPorCompañia por diarias
    var x = [];
    notificaciones.find({}).then((notif) => {
      for (i in notif) {
        if (notif[i].company_id == Company_id && notif[i].tipo == "Diaria") {
          x.push(notif[i]);
        }
      }
      callback(null, x);
    });
  };

  /**
   * Ve las notificaciones y regresa arreglo de nuevas notificaciones y pasadas
   * @param {string} User_id El id del usuario
   * @param {string} Company_id Company id
   * @param {Function(Error, object)} callback
   */

  notificaciones.VerNotificaciones = function (User_id, Company_id, callback) {
    var x = [];
    var nuevas = [];
    var viejas = [];
    var todas = [];
    notificaciones.find({}).then((notif) => {
      for (i in notif) {
        if (notif[i].company_id == Company_id) {
          //Todas las notificaciones que tengan el mismo company id

          viejas.push(notif[i]);

          for (c in notif[i].usuarios) {
            if (notif[i].usuarios[c].id == User_id) {
              notif[i].usuarios.splice(c, 1);
              viejas.pop();

              nuevas.push(notif[i]);

              axios
                .post(
                  "http://localhost:3000/api/notificaciones/" +
                    notif[i].id +
                    "/replace",
                  {
                    Servicios: notif[i].Servicios,
                    Dispositivos: notif[i].Dispositivos,
                    company_id: notif[i].company_id,
                    tipo: notif[i].tipo,
                    En_Correo: notif[i].tipo,
                    Fecha: notif[i].Fecha,
                    intervalo: notif[i].intervalo,
                    usuarios: notif[i].usuarios,
                    Descripcion: notif[i].Descripcion,
                  }
                )
                .then(function (response) {})
                .catch(function (error) {});
            } else {
              //Agregar a arreglo viejo
            }
          }
        }
      }

      notifica = [nuevas, viejas];
      callback(null, notifica);
    });
  };

  /**
   * Ve las notificaciones y regresa arreglo de nuevas notificaciones y pasadas
   * @param {string} User_id El id del usuario
   * @param {string} Company_id Company id
   * @param {Function(Error, object)} callback
   */

  notificaciones.CountNotificaciones = function (
    User_id,
    Company_id,
    callback
  ) {
    var x = [];
    var nuevas = [];
    var viejas = [];
    var todas = [];
    notificaciones.find({}).then((notif) => {
      for (i in notif) {
        if (notif[i].company_id == Company_id) {
          //Todas las notificaciones que tengan el mismo company id

          viejas.push(notif[i]);

          for (c in notif[i].usuarios) {
            if (notif[i].usuarios[c].id == User_id) {
              viejas.pop();

              nuevas.push(notif[i]);

              axios
                .post(
                  "http://localhost:3000/api/notificaciones/" +
                    notif[i].id +
                    "/replace",
                  {
                    Servicios: notif[i].Servicios,
                    Dispositivos: notif[i].Dispositivos,
                    company_id: notif[i].company_id,
                    tipo: notif[i].tipo,
                    intervalo: notif[i].intervalo,
                    En_Correo: notif[i].tipo,
                    Fecha: notif[i].Fecha,
                    usuarios: notif[i].usuarios,
                    Descripcion: notif[i].Descripcion,
                  }
                )
                .then(function (response) {})
                .catch(function (error) {});
            } else {
              //Agregar a arreglo viejo
            }
          }
        }
      }

      notifica = [nuevas, viejas];
      callback(null, notifica);
    });
  };

  notificaciones.SendRegistro = function SendRegistro(
    Email,
    password,
    nombre,
    cb
  ) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pruebacorreoleftright@gmail.com",
        pass: "31255382",
      },
    });

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".hbs",
          partialsDir: "server/templates/templatecorreo/",
          layoutsDir: "server/templates/templatecorreo/",
          defaultLayout: "ok.hbs",
        },
        viewPath: "./server/templates/templatecorreo/",
        extName: ".hbs",
      })
    );

    nombre_company = "hola";
    nombre = nombre;

    let mailOptions = {
      from: "pruebacorreoleftright@gmail.com",
      to: Email,
      subject: "CorreoSemanalIEnergybook",
      context: {
        nombre,
        password,
        Email,
        nombre_company,
      },
      attachments: [
        {
          filename: "app.png",
          path: "./server/templates/templatecorreo/svg/app.png",
          cid: "app", //same cid value as in the html
        },
        {
          filename: "playstore.png",
          path: "./server/templates/templatecorreo/svg/playstore.png",
          cid: "playstore", //same cid value as in the html
        },

        {
          filename: "whatsapp.png",
          path: "./server/templates/templatecorreo/svg/whatsapp.png",
          cid: "whatsapp", //same cid value as in the html
        },
        {
          filename: "youtube.png",
          path: "./server/templates/templatecorreo/svg/youtube.png",
          cid: "youtube", //same cid value as in the html
        },
        {
          filename: "ienergybook1x1.PNG",
          path: "./server/templates/templatecorreo/svg/ienergybook1x1.PNG",
          cid: "unique2", //same cid value as in the html
        },
        {
          filename: "Logotipo-energyBook.PNG",
          path: "./server/templates/templatecorreo/svg/Logotipo-energyBook.PNG",
          cid: "unique", //same cid value as in the html
        },
      ],
      template: "ok",
    };

    transporter.sendMail(mailOptions, (err, inf) => {
      if (err) {
        console.log(err);
      } else {
        console.log("se mando correo");
        cb(null, "Correcto");
      }
    });
  };

  notificaciones.remoteMethod("SendRegistro", {
    accepts: [
      { arg: "Email", type: "string", required: false, default: "" },
      { arg: "password", type: "string", required: false, default: "" },
      { arg: "nombre", type: "string", required: false, default: "" },
    ],
    returns: { arg: "response", type: "string" },
  });
};
