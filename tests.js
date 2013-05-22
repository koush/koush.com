var WebSocketServer = require('websocket').server;

exports.route = function(server, app) {
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (socket) {
    console.log('socket');
    socket.on('ping', function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('pong');
      socket.emit.apply(socket, args);
    });
    socket.on('message', function(msg) {
      console.log(msg);
      if (msg.constructor.name == 'Object')
        socket.json.send(msg);
      else
        socket.send(msg);
    });
  });
  
  io.of('/chat')
  .on('connection', function(socket) {
    console.log('chat socket');
  });
  
  app.get('/test/echo', function(req, res) {
    res.send(req.body);
  });
}