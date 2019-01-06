var http = require('http');
var socketio = require('socket.io');



var server = http.createServer(function(req, res){
     
}).listen(80, function(){
    console.log('Server running at http://143.248.140.251:9080');
});

// 소켓 서버를 생성한다.
var io = socketio.listen(server);
io.sockets.on('connection', function (socket){
    console.log('Socket ID : ' + socket.id + ', Connect');
    socket.on('clientMessage', function(data){
        console.log('Client Message : ' + data);
         
        var message = {
            msg : 'server',
            data : 'data'
        };
        socket.emit('serverMessage', message);
    });
});


