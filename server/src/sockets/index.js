let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on('join', (userId) => socket.join(`user_${userId}`));
    });
    return io;
  },
  getIO: () => io,
};