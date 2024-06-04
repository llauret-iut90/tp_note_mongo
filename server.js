var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

usernames = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.ejs');
});

io.on('connection', function (socket) {
    console.log('Socket connected');
    socket.on('new user', function (data, callback) {
        if (usernames.indexOf(data) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsername();
        }
    });

    //Mettre à jour les noms d'utilisateurs
    function updateUsername() {
        io.sockets.emit('usernames', usernames);
    }

    //Envoyer un message
    socket.on('send message', function (data) {
        var timestamp = new Date();
        io.sockets.emit('new message', {msg: data, user: socket.username, timestamp: timestamp});
    });

    //Déconnexion
    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsername();
    });
});

server.listen(8000, () => {
    console.log('Server running on port 3000');
});