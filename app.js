const http = require('http');
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const session = require('express-session');

const landingPageRoute = require('./routes/landing-page');
const homeRoute = require('./routes/home');
const gameRoute = require('./routes/game');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.engine('hbs', expressHbs());
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ saveUninitialized: false, resave: false, secret: 'ape' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/home', homeRoute);
app.use('/game', gameRoute);
app.use(landingPageRoute);

server.listen(3000);