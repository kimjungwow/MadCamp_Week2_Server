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

var gameProceeding = false;

var minutes = 2, the_interval = minutes * 60 * 1000;

setInterval(function() {
  console.log("START A GAME!");
  StartNewGame();
}, the_interval);


io.sockets.on('connection', function (socket) {
    console.log('Socket ID : ' + socket.id + ', Connect');
    socket.on('clientMessage', function (data) {
        // console.log('Client Message : ' + data);
        if (data.option === "signin") {
            Login.find({
                id: data.id
            }, function (err, logins) {
                console.log('signin request. ID = ' + data.id);
                if (logins.length === 0) {
                    console.log('Account does not exist.');
                    loginresult = {
                        result: '0',
                        alert: 'Account does not exist.'
                    };
                    socket.emit("userInfo", loginresult);
                    socket.disconnect(true);
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
                            socket.emit("userInfo", loginresult);
                            socket.disconnect(true);
                        } else {
                            console.log('Sign In successfully');
                            // Login.find({id:data.id, password:data.password}, function(err,logins) {
                            //     logins.forEach(function (login) {
                            //         console.log(JSON.stringify(login));
                            //         socket.emit("userInfo2", JSON.stringify(login));    

                            //     })
                            // });

                            Login.findOne({id: data.id}).lean().exec(function (err, login) {
                                console.log(JSON.stringify(login));
                                socket.emit("userInfo", JSON.stringify(login));
                                socket.disconnect(true);
                            });
                            
                        }
                    });


                }
            });

        } else if (data.option === 'signup') {
            console.log('signup request. ID = ' + data.id);
            Login.find({
                id: data.id
            }, function (err, logins) {

                if (logins.length === 0) {

                    var login = new Login();
                    login.id = data.id;
                    login.password = data.password;

                    // Set initial balance
                    login.balance = 300000;


                    login.save(function (err) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log('saved successfully');
                        console.log(JSON.stringify(login));
                        socket.emit("userInfo", JSON.stringify(login));
                        socket.disconnect(true);
                    });
                } else {
                    console.log("Account already exists")
                    loginresult = {
                        result: '3',
                        alert: "Account already exists"

                    };
                    socket.emit("userInfo", loginresult);
                    socket.disconnect(true);
                }
            });
        } else if (data.option === 'game') {
            Horse.find().lean().exec(function (err, horses) {
                console.log(JSON.stringify(horses));
                socket.emit("HorseInfo", JSON.stringify(horses));
            });
        }
    });

    socket.on('gameMessage', function (data) {

        socket.join('GAME');

        var userID = data.id;
        var userBetMoney = data.betmoney;
        var selectedHorse = data.sel_name;
    });
});

function StartNewGame () {

    gameProceeding = true;

    Horse.updateMany({},{ $set: { location: 0 }});

    var i = 1;

    function myLoop() { //  create a loop function
        setTimeout(function () { //  call a 0.5s setTimeout when the loop is called

            Horse.find({}, function (err, horses) {
                horses.forEach(function (horse) {
                        if((horse.location) > 500) {
                            horse.location = 500;
                            horse.save();

                        } else {
                            horse.location = horse.speed * i;
                            horse.save();
                        }
                    }
                );
            });

            Horse.find().lean().exec(function (err, horses) {
                console.log(JSON.stringify(horses));
                io.to('GAME').emit("HorseInfo", JSON.stringify(horses));
            });

            i++; //  increment the counter

            Horse.count({ location: 500 }, function (err, count) {
                if(count === 1) {
                    Horse.findOne({ location: 500 }, function(err, horse) {
                        horse.winner = true;
                        horse.save();
                        myLoop();
                    });
                } else if(count === 5) {
                    // SEND GAME RESULT
                    io.to('GAME').emit("GameResult", JSON.stringify());
                    gameProceeding = false;

                } else {
                    myLoop();
                }
            });

            // if (i < 300) { //  if the counter < 300 (30sec), call the loop function
            //     myLoop(); //  ..  again which will trigger another 
            // } //  ..  setTimeout()
        }, 100) // 0.1 sec
    }

    myLoop(); //  start the loop
}



// function sendGameInfo() {

//     function myLoop() { //  create a loop function
//         setTimeout(function () { //  call a 0.5s setTimeout when the loop is called

//             Horse.find().lean().exec(function (err, horses) {
//                 console.log(JSON.stringify(horses));
//                 io.to('GAME').emit("HorseInfo", JSON.stringify(horses));
//             });

//             i++; //  increment the counter

//             Horse.count({ location: 500 }, function (err, count) {
//                 if(count === 5) {
//                     // SEND GAME RESULT
//                     io.to('GAME').emit("GameResult", JSON.stringify());
//                     gameProceeding = false;
//                 } else {
//                     myLoop();
//                 }
//             });

//             // if (i < 300) { //  if the counter < 300 (30sec), call the loop function
//             //     myLoop(); //  ..  again which will trigger another 
//             // } //  ..  setTimeout()
//         }, 100) // 0.1 sec
//     }

//     myLoop(); //  start the loop
// }