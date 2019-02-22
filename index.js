const http = require('http');
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const landingPageRoute = require('./routes/landing-page');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(landingPageRoute);


server.listen(3000);