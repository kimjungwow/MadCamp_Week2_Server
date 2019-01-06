var http = require('http');
var socketio = require('socket.io');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/mongodb_tutorial',{useMongoClient: true});

var server = http.createServer(function (req, res) {

}).listen(3389, function () {
// }).listen(80, function () {
    console.log('Server running at http://143.248.140.251:9089');
});


// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));


var Login = require('./models/login');
var router2 = require('./routes/indexforlogin')(app, Login);
var loginresult;

// 소켓 서버를 생성한다.
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Socket ID : ' + socket.id + ', Connect');
    socket.on('clientMessage', function (data) {
        // console.log('Client Message : ' + data);




        if (data.option === "signin") {
            console.log('signin request. ID=' + data.id);

            Login.find({
                id: data.id
            }, function (err, logins) {
                if (logins.length === 0) {
                    console.log('Account does not exist.');
                    loginresult = {
                        result: '0',
                        alert: 'Account does not exist.'
                    };
                } else {

                    Login.find({
                        password: data.password

                    }, function (err, logins) {
                        if (logins.length === 0) {
                            console.log('Incorrect Password');
                            loginresult = {
                                result: '1'
                            };
                            socket.emit('serverMessage', loginresult);
                        } else {
                            console.log('Sign In successfully');
                            loginresult = {
                                result: '2',
                                alert:'Sign In successfully'
                            };
                            socket.emit('serverMessage', loginresult);
                            return;
                        }
                    });


                }
            });

        } else if (data.option === 'signup') {
            console.log('signup request. ID='+data.id);
            Login.find({
                id: data.id
            }, function (err, logins) {
                console.log('1111');
                if (logins.length ===0) {
                    console.log('2222');
                    var login = new Login();
                    login.id = data.id;
                    login.password = data.password;

                    console.log('3333');
                    login.save(function (err) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log('saved successfully');
                        loginresult = {
                            result: '2'
                        };
                        socket.emit('serverMessage', loginresult);
                        
                    });


                } else {
                    console.log("Account already exists")
                    loginresult = {
                        result: '3',
                        alert: "Account already exists"

                    };
                    socket.emit('serverMessage', loginresult);
                }
            });
        }



        // var message = {
        //     msg : 'server',
        //     data : 'data'
        // };
        // socket.emit('serverMessage', message);


        
        
    });
});





