const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUsers, getUser, getAllUsersRoom } = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 5000;

const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    console.log('New connection started');



    socket.on('sendMessage', (message, callback) => {
        const { error, user } = getUser(socket.id);
        if (error) {
            return callback(error);
        }
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!!!');
        }
        //console.log(user);
        io.to(user.room).emit('message', generateMessage(user.name, message));
        callback();

    });

    socket.on('disconnect', () => {
        const user = removeUsers(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.name} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getAllUsersRoom(user.room)
            });
        }
    });

    socket.on('sendLocation', (location, callback) => {
        const { error, user } = getUser(socket.id);
        if (error) {
            return callback(error);
        }
        io.to(user.room).emit('messageLocation', generateLocationMessage(user.name, `https://google.com/maps?q=${location.lat},${location.long}`));
        callback("Location Shared!!!");
    });

    socket.on('join', ({ username, room }, callback) => {
        //console.log(username, room);
        const { error, user } = addUser({ id: socket.id, name: username, room: room });
        if (error) {
            //console.log(error);
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', "Welcome!!!"));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.name} has joined!!!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getAllUsersRoom(user.room)
        });
        callback();
    });
});

server.listen(port, () => {
    console.log('Listening to port ' + port);
});