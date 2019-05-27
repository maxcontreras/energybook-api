/*var express = require('express');
var path = requiere('path');
var bodyParser = require('body-parser');


var index = require('./routes/index');
var bookings = require('./routes/bookings');


var app = express();

var port = 3000;

app.listen(port, function(){

    console.log('server running on port', port);



});

//views

app.set('views', path.join(_dirname,'views'));
app.set('view engine', 'ejs');
app.engine('html',require('ejs').renderFile);

//bodyparser
app.use(bodyParser.jason());
app.use(bodyParser.urlencoded({extended: true}))

//routees

//creo routes e index.js
app.use("/",index);
app.use('api',bookings);  */
