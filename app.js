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
var Gallery = require('./models/gallery');

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
console.log(port);

// [CONFIGURE ROUTER]
var contactRouter = require('./routes/indexforcontact')(app, Contact);
app.use('/api/contacts', contactRouter);
var loginRouter = require('./routes/indexforlogin')(app, Login);
app.use('/api/logins', loginRouter);
var galleryRouter = require('./routes/indexforgallery')(app, Gallery);
app.use('/api/gallerys', galleryRouter)



// [RUN SERVER]
var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});

