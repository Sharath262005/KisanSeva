let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join', (userId) => socket.join(`user_${userId}`));

      socket.on('join_booking_room', (bookingId) => {
        socket.join(`booking_${bookingId}`);
      });

      socket.on('driver_location_update', async ({ bookingId, latitude, longitude }) => {
        console.log(`📍 Location for booking ${bookingId}: ${latitude}, ${longitude}`);

        // ✅ Save GPS log to database
        try {
          const pool = require('../config/db');
          await pool.query(
            'INSERT INTO gps_logs (booking_id, latitude, longitude) VALUES (?, ?, ?)',
            [bookingId, latitude, longitude]
          );
        } catch (err) {
          console.error('Failed to save GPS log:', err);
        }

        // Broadcast to farmer in the booking room
        io.to(`booking_${bookingId}`).emit('driver_location', { latitude, longitude });
      });
    });

    return io;
  },
  getIO: () => io,
};