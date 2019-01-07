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

mongoose.connect('mongodb://localhost/mongodb_tutorial', {
    useMongoClient: true
});

var server = http.createServer(function (req, res) {

}).listen(3389, function () {
    // }).listen(80, function () {
    console.log('Server running at http://143.248.140.251:9089');
});


// DEFINE MODEL
var Contact = require('./models/contact');
var Login = require('./models/login');
var Gallery = require('./models/gallery');
var Horse = require('./models/horse');

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));

var loginresult;
loginresult = {
    result: '4'
};

// 소켓 서버를 생성한다.
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Socket ID : ' + socket.id + ', Connect');
    socket.on('clientMessage', function (data) {
        // console.log('Client Message : ' + data);
        if (data.option === "signin") {
            Login.find({
                id: data.id
            }, function (err, logins) {
                console.log('signin request. ID=' + data.id);
                if (logins.length === 0) {
                    console.log('Account does not exist.');
                    loginresult = {
                        result: '0',
                        alert: 'Account does not exist.'
                    };
                    socket.disconnect(0);
                } else {

                    Login.find({
                        password: data.password

                    }, function (err, logins) {
                        if (logins.length === 0) {
                            console.log('Incorrect Password');
                            loginresult = {
                                result: '1'
                            };
                            console.log('changed' + loginresult.result);
                            socket.emit('serverMessage', loginresult);
                            socket.disconnect(0);
                        } else {
                            console.log('Sign In successfully');
                            loginresult = {
                                result: '2',
                                alert: 'Sign In successfully'
                            };
                            console.log("changed" + loginresult.result);
                            socket.emit('serverMessage', loginresult);

                        }
                    });


                }
            });

        } else if (data.option === 'signup') {
            console.log('signup request. ID=' + data.id);
            Login.find({
                id: data.id
            }, function (err, logins) {

                if (logins.length === 0) {

                    var login = new Login();
                    login.id = data.id;
                    login.password = data.password;


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
                    socket.disconnect(0);
                }
            });
        } else if (data.option === 'game') {
            Horse.find({}, {
                _id: 0,
                speed: 1,
                name: 1,
                location: 1

            }, function (err, horses) {




                var i = 1;
                Horse.find({}, function(err, horses) {
                    horses.forEach(function (horse) {
                        horse.location=0;
                        horse.save();

                    });
                });

                

                function myLoop() { //  create a loop function
                    setTimeout(function () { //  call a 0.5s setTimeout when the loop is called



                        // a(socket, i);
                        Horse.find({
                            location: {
                                $lt: 100
                            }
                        }, function (err, horses) {
                            horses.forEach(function (horse) {
                                // socket.emit(horse.name, [{"name": horse.name}, {"time":i}, {"location": horse.location}] );


                                if(horse.location<100) {
                                    if((horse.speed*i)>100) {

                                        horse.location=100;
                                        socket.emit(horse.name, [{"name": horse.name}, {"time":i}, {"location": horse.location}] );
                                        // console.log(1, horse.name, horse.location);
                                        horse.save();

                                    } else {

                                        horse.location=horse.speed*i;
                                        socket.emit(horse.name, [{"name": horse.name}, {"time":i}, {"location": horse.location}] );
                                        // console.log(2, horse.name, horse.location);
                                        horse.save();

                                    }
                                }
                            });
                        });









                        // alert('hello'); //  your code here
                        i++; //  increment the counter
                        if (i < 50) { //  if the counter < 10, call the loop function
                            myLoop(); //  ..  again which will trigger another 
                        } //  ..  setTimeout()
                    }, 50)
                }

                myLoop(); //  start the loop
            })


        }

    });
});

function a(p, i) {
    var testList = new Array();


    Horse.findOne({
        name: "Alpha"
    }).then(function (docs) {
        docs.location = docs.speed * i;

        p.emit('serverMessage', [{
            "name": docs.name
        }, {
            "time": i
        }, {
            "location": docs.location
        }]);
    });

}