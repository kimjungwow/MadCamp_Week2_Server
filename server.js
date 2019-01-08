var http = require('http');
var socketio = require('socket.io');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

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

var minutes = 0.4,
    the_interval = minutes * 60 * 1000;
// var the_interval = 15 * 1000;

setInterval(function () {
    console.log("START A GAME!");
    var sec = (minutes * 60) - 1;

    function myLoop() { //  create a loop function
        setTimeout(function () { //  call a 0.5s setTimeout when the loop is called
            console.log(sec);
            io.to('GAME').emit("timeLeft", sec.toString());
            sec--;
            if (sec > 0) { //  if the counter < 300 (30sec), call the loop function
                myLoop(); //  ..  again which will trigger another 
            } //  ..  setTimeout()
        }, 1000) // 0.1 sec
    }
    myLoop();
    initSpeed(StartNewGame);
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

                            Login.findOne({
                                id: data.id
                            }).lean().exec(function (err, login) {
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
                    login.betMoney = 0;
                    login.horse = "NOTHING"


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
                socket.emit("FirstHorseInfo", JSON.stringify(horses));
            });
        }
    });

    socket.on('gameMessage', function (data) {

        // socket.nickname = data.id;
        // console.log(socket.nickname);

        Login.update({
            "id": data.id
        }, {
            $set: {
                "horse": data.sel_name,
                "betMoney": data.betmoney
            }
        }).then(() => {
            socket.join('GAME');
        });



    });
});

function StartNewGame() {
    Horse.updateMany({}, {
        $set: {
            location: 0,
            winner: false,
            isFallOff: false
        }
    }, (err) => {
        if (err) {
            return console.log("Error on update");
        }
        Login.find({}, function (err, users) {
            users.forEach(function (user) {
                user.balance -= user.betMoney;
                user.save();
            });
            gameProceeding = true;


            var i = 1;

            function myLoop() { //  create a loop function
                setTimeout(function () { //  call a 0.5s setTimeout when the loop is called

                    Horse.find({}, function (err, horses) {

                        horses.forEach(function (horse) {
                            if (i % 10 === 0) {
                                if (doRoulette(horse.fallOff)) {
                                    horse.isFallOff = true;
                                    horse.save();
                                } else {
                                    horse.isFallOff = false;
                                    horse.save();
                                }
                            }
                            if ((horse.location) > 500) {
                                horse.location = 500;
                                horse.save();
                            } else if (!horse.isFallOff && horse.speed >= horse.maxSpeed) {
                                horse.speed = horse.maxSpeed;
                                horse.location += horse.speed;
                                if (horse.location > 500) {
                                    horse.location = 500;
                                }
                                horse.save();
                            } else if (!horse.isFallOff) {
                                horse.speed += horse.acceleration / 5;
                                horse.location += horse.speed;
                                if (horse.location > 500) {
                                    horse.location = 500;
                                }
                                horse.save();
                            }
                        });

                        Horse.find().lean().exec(function (err, horses) {
                            // console.log(JSON.stringify(horses));
                            io.to('GAME').emit("HorseInfo", JSON.stringify(horses));

                            i++; //  increment the counter

                            Horse.count({
                                location: {
                                    $gte: 500
                                }
                            }, function (err, count) {
                                if (count === 5) {
                                    // SET USER INFO
                                    Horse.findOne({
                                        "winner": true
                                    }, function (err, horse) {

                                        //Login.updateMany({"horse": horse.name}, )
                                        Login.find({
                                            "horse": horse.name
                                        }, function (err, users) {
                                            // Login.find

                                            users.forEach(function (user) {
                                                user.balance += horse.dividendRate * user.betMoney;
                                                user.save();
                                            });



                                        }).then(Login.updateMany({}, {
                                            $set: {
                                                horse: horse.name
                                            }
                                        }).then(function () {
                                            Login.find().lean().exec(function (err, users) {
                                                console.log(users);
                                                io.to('GAME').emit("GameResult", JSON.stringify(users));
                                            });
                                            gameProceeding = false;
                                        }));
                                    });
                                } else if (count === 1) {
                                    // Horse.findOne({ location: { $gte: 500 }}, function(err, horse) {
                                    //         console.log(horse);
                                    //         horse.winner = true;
                                    //         horse.save();
                                    //         myLoop();
                                    // });

                                    Horse.find({
                                        location: {
                                            $gte: 500
                                        }
                                    }, function (err, horses) {
                                        horses.forEach(function (horse) {
                                            console.log(horse);
                                            horse.winner = true;
                                            horse.save();
                                            myLoop();
                                        });
                                    });
                                } else {
                                    myLoop();
                                }
                            });
                        });
                    });
                    // if (i < 300) { //  if the counter < 300 (30sec), call the loop function
                    //     myLoop(); //  ..  again which will trigger another 
                    // } //  ..  setTimeout()
                }, 100) // 0.1 sec
            }

            myLoop(); //  start the loop
        });
    });

}


function doRoulette(percentage) {
    var randomNum = getRandomFloat(0, 1);
    if (randomNum < percentage) {
        return true;
    }
    return false;
}

function getRandomFloat(min, max) { //min ~ max 사이의 임의의 정수 반환
    return (Math.random() * (max - min)) + min;
}


function initSpeed(startNewGam) {
    Horse.findOneAndUpdate({
        name: "Alpha"
    }, {
        $set: {
            speed: 6
        }
    }, function () {
        Horse.findOneAndUpdate({
            name: "Bravo"
        }, {
            $set: {
                speed: 6
            }
        }, function () {
            Horse.findOneAndUpdate({
                name: "Charlie"
            }, {
                $set: {
                    speed: 8
                }
            }, function () {
                Horse.findOneAndUpdate({
                    name: "Delta"
                }, {
                    $set: {
                        speed: 10
                    }
                }, function () {
                    Horse.findOneAndUpdate({
                        name: "Echo"
                    }, {
                        $set: {
                            speed: 4
                        }
                    }, function () {
                        startNewGam();
                    });
                });
            });
        });
    });
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