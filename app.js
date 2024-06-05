require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const csrf = require('csurf');
const passport = require('passport');
const logger = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
const SQLiteStore = require('connect-sqlite3')(session);

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');

const app = express();

const server = http.createServer(app);
const io = socketIO(server);


let usernames = [];
let chatHistory = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'butinfos4', resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({db: 'sessions.db', dir: './var/db'})
}));
// app.use(csrf());
app.use(passport.authenticate('session'));
app.use(function (req, res, next) {
    const msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
});
app.use(function (req, res, next) {
    // res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const messageController = require('./backend/api/controllers/MessageController');

app.get('/', (req, res) => {
    res.render('index', {messageController: messageController});
});

io.on('connection', function (socket) {
    console.log('Socket connected');
    // socket.emit('chat history', chatHistory);
    socket.on('new user', function (data, callback) {
        if (usernames.indexOf(data) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsername();
            updateChatHistory();
        }
    });

    //Mettre à jour les noms d'utilisateurs
    function updateUsername() {
        io.sockets.emit('usernames', usernames);
    }

    function updateChatHistory() {
        console.log('jenvoie les msg dans history : ', chatHistory)
        io.sockets.emit('chat history', chatHistory)
    }

    //Envoyer un message
    socket.on('send message', function (data) {
        var timestamp = new Date().toLocaleTimeString();
        var message = {msg: data, user: socket.username, timestamp: timestamp};
        // chatHistory.push(message);
        chatHistory.push(message)
        console.log('message', message)
        io.sockets.emit('new message', message);
    });

    //Déconnexion
    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsername();
    });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = {app, server}