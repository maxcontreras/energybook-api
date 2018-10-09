'use strict';
var app = require('../../server/server');
var eUsers = app.loopback.getModel('eUser');
var Role = app.loopback.getModel('Role');
var RoleMapping = app.models.RoleMapping;

Role.create({
    name: 'admin'
}, function (err, role) {
    if(err)console.log(err);

    eUsers.find({type: 1}, function (err, res) {
        for (var a = 0; a < res.length; a++) {
            role.principals.create({
                principalType: RoleMapping.USER,
                principalId: res[a].id
            }, function (err, principal) {
            });
        }
    });
});
