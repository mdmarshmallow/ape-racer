const http = require('http');
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

//Routing
app.get('/', (request, response, next) => {
    response.sendFile(path.join(__dirname + '/static', 'index.html'));
});

server.listen(3000);

io.on('connection', socket => {});

setInterval(() => {
    io.sockets.emit('message', 'hi!');
  }, 1000);