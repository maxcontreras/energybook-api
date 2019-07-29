const CronJob = require('cron').CronJob;
const async = require('async');

var app = require('../server');

const eUsers = app.loopback.getModel('eUser');
const meter = app.loopback.getModel('Meter');
const designatedMeter = app.loopback.getModel('DesignatedMeter');

const mail = require('../modules/mail.js');
const path = require('path');

const Constants = require('../../server/constants.json');

const timezone = 'America/Mexico_City';

const mailSummary = (filter) => {
  console.log("starting mailSummary job")
  //generación, autoconsumo e inyeccion a la red y sus respectivos costos
  eUsers.find({
    include: [
      {
        relation: 'company'
      }
    ]
  }, (err, users) => {
    users.forEach((user) => {
      if (!user.company()) return;
      designatedMeter.find({
        include: [
          {
            relation: 'meter'
          },
          {
            relation: 'services'
          }
        ],
        where: {
          and: [
            {
              "company_id": user.company().id
            }
          ]
        }
      }, async (err, res) => {
        if (err || !res) {
          return;
        }
        res = res[0];
        if (!res) {
          return;
        }
        let services = {};
        res.services().forEach((service) => {
          services[service.serviceName] = {
            'name': service.serviceName
          }
        })

        let devices = {};
        res.devices.shift(); //removes eds
        res.devices.forEach((device) => {
          devices[device.description] = {
            'name': device.description
          }
        })

        let errorWhileGatheringData = null;
        await Promise.all([
          new Promise((resolve, reject) => {
            //services consumption and costs
            if (!res.services()) {
              return resolve();
            }
            async.each(res.services(), (service, cb) => {
              meter.getConsumptionCostsByFilter(res.meter().id, null, service.serviceName, filter, 0, null,
                (err, res) => {
                  if (err) return cb(err);
                  
                  let totalConsumption = 0;
                  let totalCost = 0;
                  res.forEach((hourlyInfo) => {
                    totalConsumption += hourlyInfo.consumption;
                    totalCost += hourlyInfo.cost;          
                  });
            
                  let energy = parseFloat(totalConsumption.toFixed(2));
                  let cost = parseFloat(totalCost.toFixed(2));

                  services[service.serviceName].consumption = {energy,cost}
                  cb();
                });
            }, err => {
              if(err) reject(err);
              resolve();
            })
          }),
          new Promise((resolve, reject) => {
            //devices consumption and costs
            if (!res.devices) {
              return resolve()
            }
            async.each(res.devices, (device, cb) => {
              meter.getConsumptionCostsByFilter(res.meter().id, device.name, '', filter, 0, null,
              (err, res) => {
                if(err) return cb(err);
                let totalConsumption = 0;
                let totalCost = 0;
                res.forEach((hourlyInfo) => {
                  totalConsumption += hourlyInfo.consumption;
                  totalCost += hourlyInfo.cost;          
                });
                let energy = parseFloat(totalConsumption.toFixed(2));
                let cost = parseFloat(totalCost.toFixed(2)); 

                devices[device.description].consumption = {energy, cost}
                cb();
              })
            }, err => {
              if (err) reject(err);
              resolve();
            })
          }),
          new Promise((resolve, reject) => {
            if (!res.services()) {
              return resolve();
            }
            //services generation
            async.each(res.services(), (service, cb) => {
              meter.generationReadings(res.meter().id, null, service.serviceName, filter, 0, 3, null,
              (err, res) => {
                if (err) return cb(err);

                let energy = 0;
                let cost = 0;
                
                res.generation.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;          
                });                
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                services[service.serviceName].generation = {energy, cost}
                
                energy = 0;
                cost = 0;
                
                res.netInjection.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;  
                })
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                services[service.serviceName].netInjection = {energy, cost}
                
                energy = 0;
                cost = 0;

                res.selfConsumption.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;  
                })
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                services[service.serviceName].selfConsumption = {energy, cost}
                cb();
              })
            }, err => {
              if (err) return reject(err);
              resolve();
            })
          }),
          new Promise((resolve, reject) => {
            if (!res.devices) {
              return resolve()
            }
            //devices generation
            async.each(res.devices, (device, cb) => {

              meter.generationReadings(res.meter().id, device.name, null, filter, 0, 3, null,
              (err, res) => {
                if(err) return cb(err);
                  
                let energy = 0;
                let cost = 0;

                res.generation.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;          
                });                
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                devices[device.description].generation = {energy, cost}
                
                energy = 0;
                cost = 0;
                
                res.netInjection.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;  
                })
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                devices[device.description].netInjection = {energy, cost}
                
                energy = 0;
                cost = 0;

                res.selfConsumption.forEach((hourlyInfo) => {
                  energy += hourlyInfo.value;
                  cost += hourlyInfo.cost;  
                })
                energy = parseFloat(energy.toFixed(2));
                cost = parseFloat(cost.toFixed(2));
                devices[device.description].selfConsumption = {energy, cost}
                cb();
              })
            }, err => {
              if(err) reject(err);
              else resolve();
            })
          })
        ])
        .catch(err => {
          errorWhileGatheringData = err;
        })

        if(errorWhileGatheringData) {
          console.log("error while preparing the weekly summary email to " + user.email + ": ");
          console.log(errorWhileGatheringData);
          return;
        }

        const templatePath = path.join(__dirname, '/../templates/weeklyInfo.mustache')
        let arrServices = [];
        let arrDevices = [];
        for (let key in services) {
          arrServices.push(services[key]);
        }
        for (let key in devices) {
          arrDevices.push(devices[key]);
        }
        const templateVars = {
          user,
          company: user.company(),
          services: arrServices.sort((a, b) => { return a.name < b.name ? -1 : 1 }),
          devices: arrDevices.sort((a, b) => { return a.name < b.name ? -1 : 1 })
        };
        
        mail.sendMail(templatePath, templateVars, {to: user.email, subject: "Reporte semanal de costos de energía"});
      })
    })
  })
}

if (process.env.ENVIRONMENT === 'production') {
  new CronJob('0 50 23 * * 6', () => {mailSummary(Constants.Meters.filters.week)}, null, true, timezone);
  new CronJob('0 50 23 * */1 *', () => {mailSummary(Constants.Meters.filters.month)}, null, true, timezone);
}
if (process.env.ENVIRONMENT === 'development') {
  //new CronJob('*/20 * * * * *', () => {mailSummary(Constants.Meters.filters.week)}, null, true, timezone);
}
