const CronJob = require('cron').CronJob;
const app = require('./../server');
const DesignatedMeter = app.loopback.getModel('DesignatedMeter');

var timezone = 'America/Mexico_City';

var epimpHistory = new CronJob('50 * * * *', function () {
    console.log('Starting epimp history job')
    DesignatedMeter.epimpHistory(undefined, (err, res) => {
        console.log('Finished epimpHistory job')
        if (err) console.log("Error ", JSON.stringify(err, null, 2));
    });
}, function () {
    /* This function is executed when the job stops */
},
    true,
    timezone
);

function EPimpHistory(){
    var self = this;

    self.init = function(){
        this.epimpHistory = epimpHistory;
    }

    self.getEPimpHistory = function getEPimpHistory(meter){
        EDS.readDemand(meter, function(err, epimpHistory){
            if(epimpHistory){
                let socketData = {
                    socketEvent: 'epimpHistoryReading',
                    data: epimpHistory
                };
                socketData = JSON.stringify(socketData);
                Socket.sendMessageToCompanyUsers(meter.company().id, socketData);
                return;
            }
        });
    }

    self.init();
}

module.exports = EPimpHistory;
