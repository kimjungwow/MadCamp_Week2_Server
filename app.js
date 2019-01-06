// serverjs

// [LOAD PACKAGES]
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/mongodb_tutorial',{useMongoClient: true});

// DEFINE MODEL
var Contact = require('./models/contact');
var Login = require('./models/login');

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));

// [CONFIGURE SERVER PORT]


var port = process.env.PORT || 80;

// [CONFIGURE ROUTER]
var router = require('./routes/indexforcontact')(app, Contact);
var router2 = require('./routes/indexforlogin')(app, Login);

// [RUN SERVER]
var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});