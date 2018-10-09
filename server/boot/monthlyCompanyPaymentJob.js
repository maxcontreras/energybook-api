const CronJob = require('cron').CronJob;
const app = require('./../server');
const async = require('async');
const moment = require('moment-timezone');
const Company = app.loopback.getModel('Company');
const Payment = app.loopback.getModel('Payment');

moment.tz.setDefault("America/Mexico_City");
var timezone = 'America/Mexico_City';
// * * */1 * *
var monthlyPaymentRow = new CronJob('00 00 12 1 * *', function() {
    /*
    * Runs first day of the month
    * at 12:00 hrs central time.
    * Set monthy payment row for every active company
    */
    let month = moment().month();
    Company.find({
        where: {
            status: 1
        }
    }, function(err, companies){
        async.each(companies, function (company, next){
            Payment.create({
                month: month + 1,
                company_id: company.id,
                paid: false,
                created_at: new Date(),
                updated_at: new Date()
            },function(err, payment){
                next();
            });
        }, function(err){
            return;
        });
    });
}, function () {
        /* This function is executed when the job stops */
},
    true,
    timezone
);
