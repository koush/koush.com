var WebSocketServer = require('websocket').server;

exports.route = function(server, app) {
  // var io = require('socket.io').listen(server);
  // io.sockets.on('connection', function (socket) {
  //   socket.on('message', function(msg) {
  //     console.log(msg);
  //     socket.send(msg);
  //   });
  // });

  var wsServer = new WebSocketServer({
      httpServer: server
  });

  wsServer.on('request', function(request) {
    if (request.requestedProtocols.indexOf('echo-protocol') == -1)  {
      return;
    }
    console.log(request);
      var connection = request.accept('echo-protocol', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message) {
          if (message.type === 'utf8') {
              console.log('Received Message: ' + message.utf8Data);
              connection.sendUTF(message.utf8Data);
          }
          else if (message.type === 'binary') {
              console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
              connection.sendBytes(message.binaryData);
          }
      });
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });
}