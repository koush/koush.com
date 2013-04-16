var WebSocketServer = require('websocket').server;

exports.route = function(server, app) {
  var wsServer = new WebSocketServer({
      httpServer: server
  });

  wsServer.on('request', function(request) {
    console.log('stuff');
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