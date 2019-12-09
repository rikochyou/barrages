let WebSocket = require('ws');
let redis = require('redis');
let client = redis.createClient();
let wss = new WebSocket.Server({ port: 3000 });
let clientArr = [];
wss.on('connection', function(ws) {
  clientArr.push(ws);
  client.lrange('barrages', 0, -1, function(err, applies) {
    applies = applies.map(item => JSON.parse(item));
    ws.send(
      JSON.stringify({
        type: 'INIT',
        data: applies
      })
    );
  });
  ws.on('message', function(data) {
    client.rpush('barrages', data, redis.print);
    clientArr.forEach(w => {
      w.send(JSON.stringify({ type: 'ADD', data: JSON.parse(data) }));
    });
  });
  ws.on('close', function() {
    clientArr.filter(client => client != ws);
  });
});
