const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

io.on('connection', (socket) => {
  console.log('A user connected! ID:', socket.id);

  socket.on('chat message', (data) => {
    console.log('Received message:', data);

    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected! ID:', socket.id);
  });
});  

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});