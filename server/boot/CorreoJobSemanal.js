const app = require('../server');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const notificaciones = app.models.notificaciones
var cron = require('node-cron');
const eUser = app.models.eUser

const Company = app.models.Company

var mensaje_bien = []
var Dispositivos_bien = []
var fila = []





// Credenciales para correo
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pruebacorreoleftright@gmail.com',
        pass: '31255382'
    }
});

transporter.use('compile', hbs({
    viewEngine: {
        extName: '.hbs',
        partialsDir: 'server/templates/templatecorreo/',
        layoutsDir: 'server/templates/templatecorreo/',
        defaultLayout: 'index.hbs'
    },
    viewPath: './server/templates/templatecorreo/',
    extName: '.hbs'
}));

let x = cron.schedule(
    '20 9 * * 1',
    () => { // Segun gurutab “At 09:20 on Monday.” 20 minutos despues de cuando se crearon las notificaciones para no causar errores
        // Para fines de prueba propongo  * * * * * '20 9 * * 1'

        notificaciones.find({
            where: {
                tipo: 'Semanal', // buscan los notificaciones Semanal
                En_Correo: false
            }
        }, function (err, notificaciones) {
            notificaciones.forEach(notificacion => {
                eUser.find({
                    where: {
                        company_id: notificacion.company_id
                    }
                }, function (err, eUsers) { // saca a los usuarios por compañia
                    eUsers.forEach(eUser => {

                        Company.findOne({
                            where: {
                                id: eUser.company_id
                            }
                        }, function (err, company) {
                            var nombre_company = company.company_name

                            notificacion.Dispositivos.forEach(Dispo =>{
                                    separando = Dispo.split(' ')

                                unirse = {
                                    dispositivo: separando[0],
                                    costo: separando[1]
                                }
                                fila.push(unirse)

                                    
                            })
                            




                            let mailOptions = {
                                from: 'pruebacorreoleftright@gmail.com',
                                to: 'sushipass2@gmail.com',
                                subject: 'Testing',
                                context: {
                                    fila, 
                                    nombre_company
                                },
                                attachments: [
                                    {
                                        filename: 'ienergybook1x1.PNG',
                                        path: './server/templates/templatecorreo/svg/ienergybook1x1.PNG',
                                        cid: 'unique2' //same cid value as in the html
                                    }, {
                                        filename: 'Logotipo-energyBook.PNG',
                                        path: './server/templates/templatecorreo/svg/Logotipo-energyBook.PNG',
                                        cid: 'unique' //same cid value as in the html
                                    },
                                     {
                                        filename: 'iEnergybook-bita.PNG',
                                        path: './server/templates/templatecorreo/svg/iEnergybook-bita.PNG',
                                        cid: 'nota' //same cid value as in the html
                                    }, {
                                        filename: 'iEnergybookCosto.PNG',
                                        path: './server/templates/templatecorreo/svg/iEnergybookCosto.PNG',
                                        cid: 'costo' //same cid value as in the html
                                    }, {
                                        filename: 'iEnergybookConsumo-08.PNG',
                                        path: './server/templates/templatecorreo/svg/iEnergybookConsumo-08.PNG',
                                        cid: 'consumo' //same cid value as in the html
                                    }
                                ],
                                template: 'index'
                            }

                            transporter.sendMail(mailOptions, (err, inf) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(inf)
                                }
                            })

                            // Datos que manda en el contexto console.log(fila) te imprime el usuario
                            // console.log('Con usuario ') Literal el usuario  console.log(eUser) te avisa
                            // cuando sigue la siguiente notificacion console.log('siguiente notificacion')
                            // Es muy importante
fila=[]

                        })

                    })
                });

            });

        });

     /*   notificaciones.updateAll({
            tipo: 'Semanal', // buscan los notificaciones Semanal
            En_Correo: false

        }, {
            En_Correo: true
        }, function () {
            console.log('se actualizaron los registros en notificaciones')
        })

        */
  }
);