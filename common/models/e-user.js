'use strict';

const app = require('./../../server/server.js');
const Company = app.loopback.getModel('Company');
const Constants = require('./../../server/constants.json');
const WS = require('../../server/boot/websockets');
const Socket = new WS;

var moment = require('moment-timezone');

module.exports = function(Euser) {

    Euser.beforeRemote('login', function(ctx, modelInstance, next) {
        if (!ctx.req.body.email || !ctx.req.body.password)
            return next({statusCode: 404, message: 'Datos insuficientes para iniciar sesión.'});
        Euser.findOne({
            where:{ email: ctx.req.body.email },
            include: {
                relation: 'company'
            }
        }, function(err, user){
            if (err) return next(err);
            if (!user) return next({statusCode: 404, message: 'Usuario inexistente.'});
            if (user.role_id === Constants.Eusers.roles.Admin) return next();
            // TODO: bloq user if registration free time is done
            if(user.company().status === Constants.Companies.status.Bloqueada) return next({statusCode: 403, message: 'Lo sentimos tu empresa está bloqueada, por favor contacta a soporte'});
            return next();
        });
    });

    Euser.afterRemote('login', function (ctx, modelInstance, next) {
        var id = ctx.result.userId;
        Euser.findById(id, function (err, res) {
            if (res) {
                res.lastLogin = new Date;
                res.save(function (err, user) {
                    if (err) next();
                });
            }
        });
        next();
    });
};
