const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

const EDS = require('../../server/modules/eds-connector');
var timezone = 'America/Mexico_City';


var monthlyReadings = new CronJob('0,15,30,45 * * * *', function () {
    DesignatedMeter.monthlyReadings((err, res) => {
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);

function Demand(){
    var self = this;

    self.init = function(){
        this.monthlyReadings =  monthlyReadings;
    }

    self.getDemand = function getDemand(meter){
        EDS.readDemand(meter, function(err, demand){
            if(demand){
                let socketData = {
                    socketEvent: 'demandReading',
                    data: demand
                };
                socketData = JSON.stringify(socketData);
                Socket.sendMessageToCompanyUsers(meter.company().id, socketData);
                return;
            }
        });
    }

    self.init();
}

module.exports = Demand;
