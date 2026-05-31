let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on('join', (userId) => socket.join(`user_${userId}`));
      // Driver joins booking room and sends location
      socket.on('join_booking_room', (bookingId) => {
        socket.join(`booking_${bookingId}`);
      });

      socket.on('driver_location_update', ({ bookingId, latitude, longitude }) => {
        // Broadcast to all clients in that booking room (including the farmer)
        io.to(`booking_${bookingId}`).emit('driver_location', { latitude, longitude });
        // Optionally save to database GPS logs (we can add later)
      });
    });
    return io;
  },
  getIO: () => io,
};