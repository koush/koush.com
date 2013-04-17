var WebSocketServer = require('websocket').server;

exports.route = function(server, app) {
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (socket) {
    socket.on('message', function(msg) {
      console.log(msg);
      socket.send(msg);
    });
  });
}