const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const colyseus = require('colyseus');

const landingPageRoute = require('./routes/landing-page');
const homeRoute = require('./routes/home');
const gameRoute = require('./routes/game');

const typeroom = require('./room/typeroom');

const app = express();

const gameServer = new colyseus.Server({
    server: http.createServer(app)
});

//register another room with the same class but with a private option
gameServer.register('typeroom', typeroom, {
    private: false,
});
gameServer.register('typeroom-private', typeroom, {
    private: true
});

app.engine('hbs', expressHbs());
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ saveUninitialized: false, resave: false, secret: 'ape' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/home', homeRoute);
app.use('/game', gameRoute);
app.use(landingPageRoute);

gameServer.listen(process.env.PORT || 3000);