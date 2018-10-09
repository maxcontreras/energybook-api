'use strict';

const app = require('./../server');
const http = require('http');
const engine = require('engine.io');
const eUser = app.loopback.getModel('eUser');
const Company = app.loopback.getModel('Company');
const async = require('async');

var moment = require('moment-timezone');

var ws = engine.attach(app.start());

var generateId = function(sock, id){
    ws.clients[id] = sock;
}

var checkAccessToken = function checkAccessToken(model, jsonData){
    model.accessToken.findById(jsonData.accessToken, {
        where: {
            userId: jsonData.userId
        }
    }, function(err, res){ });
}

ws.on('connection', function (socket){
    socket.on('message', function(data){
        var jsonData = JSON.parse(data);
        generateId(ws.clients[socket.id], jsonData.userId);

        switch (jsonData.socketEvent) {
            case 'checkStatus':
                break;
            default:
                break;
        }
    });

    socket.on('close', function(){
        // Redis.flushAll();
    });
});

function Socket(){
    var self = this;

    self.init = function(){
        this.ws = ws;
    }

    self.sendMessageToCompanyUsers = function(company_id, data){
        Company.findById(company_id, {
            include: [
                {
                    relation: 'users'
                }
            ],
        }, function(err, company){
            async.each(company.users(), function(user, next){
                self.sendMessageToUser(user.id, data);
                next();
            });
        });
    }

    self.sendMessageToUser = function(userId, data){
        if(ws.clients[userId]){
            ws.clients[userId].send(data);
        }
    }

    self.init();
}

module.exports = Socket;
