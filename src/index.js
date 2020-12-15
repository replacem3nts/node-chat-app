const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    const welcomeMsg = { message: 'Welcome!' };
    const userJoinMsg = { message: `${user.username} has joined the room!` };

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage(welcomeMsg));
    socket.broadcast.to(room).emit('message', generateMessage(userJoinMsg));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const { room, username } = getUser(socket.id);
    const data = { username, message };

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(room).emit('message', generateMessage(data));
    callback();
  });

  socket.on('sendLocation', (pos, callback) => {
    const { room, username } = getUser(socket.id);
    const data = {
      username,
      url: `https://google.com/maps?q=${pos.latitude},${pos.longitude}`,
    };

    io.to(room).emit('locationMessage', generateLocationMessage(data));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage({ message: `${user.username} has left!` })
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
