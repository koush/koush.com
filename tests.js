var WebSocketServer = require('websocket').server;

exports.route = function(server, app) {
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (socket) {
    console.log('socket');
    
    socket.on('poop', function(ping){
         var ack = function(data){
          socket.emit('ack',data);
         }
      socket.emit('scoop','scoop', ack);
    });
    
    socket.on('ping', function(data, cb) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('pong');
      socket.emit.apply(socket, args);
      console.log(arguments);
    });
    socket.on('message', function(msg, cb) {
      console.log(arguments);
      console.log(msg);
      if (msg.constructor.name == 'Object') {
        socket.json.send(msg);
      }
      else {
        socket.send(msg, function(msg) {
          socket.send(msg);
        });
      }
      if (cb)
        cb(msg);
    });
    socket.on('disconnect', function() {
      console.log('disconnected from main channel');
    })
  });
  
  io.of('/chat')
  .on('connection', function(socket) {
    console.log('chat socket');
    socket.on('ping', function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('pong');
      socket.emit.apply(socket, args);
    });
    socket.on('message', function(msg) {
      console.log('ponging');
      console.log(msg);
      if (msg.constructor.name == 'Object')
        socket.json.send(msg);
      else
        socket.send(msg);
    });
  });
  
  app.post('/test/echo', function(req, res) {
    res.send(req.body);
  });
  
  app.get('/test/hang', function(req, res) {
    
  });
}