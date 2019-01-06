// serverjs

// [LOAD PACKAGES]
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const fs = require('fs');
const gridfs = require('gridfs-stream');


mongoose.connect('mongodb://localhost/mongodb_tutorial',{useMongoClient: true});

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
gridfs.mongo = mongoose.mongo;


db.on('error', console.error);
db.once('open', function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
    var gfs = gridfs(mongoose.connection.db);

    // var writestream = gfs.createWriteStream({ filename: "test.txt" });

    // var s = new Readable;
    // s.push('beep') 
    // s.push(null)

    // s.pipe(writestream);
    // writestream.on('close', function (file) {
    //     console.log(file.filename);
    // });

    // var readStream = gfs.createReadStream({
    //     _id: '5c322b64cc385c7c91bb62b9',
    //   });

    //   const chunks = [];

    //   readStream.on("data", function (chunk) {
    //     chunks.push(chunk);
    //   });
    
    //   // Send the buffer or you can put it into a var
    //   readStream.on("end", function () {
    //     str = (Buffer.concat(chunks)).toString();
    //     console.log(str);
    //   });

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
    var galleryRouter = require('./routes/indexforgallery')(app, Gallery, gfs);
    app.use('/api/galleries', galleryRouter)



    // [RUN SERVER]
    var server = app.listen(port, function () {
        console.log("Express server has started on port " + port)
    });
});





// const Readable = require('stream').Readable;
// const s = new Readable();
// s._read = () => {}; // redundant? see update below
// s.push('your text here');

//   // create or save a file to gridfs
// const readStream = fs.createReadStream(s);
// const options = ({ filename: 'sample.txt', contentType: 'text/plain' });
// gfs.write(options, readStream, (error, file) => { console.log(file); });


