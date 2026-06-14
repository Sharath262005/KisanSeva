import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
let socket;

export const connectSocket = (userId) => {
  socket = io(SOCKET_URL);
  socket.emit('join', userId);
  return socket;
};

export const onNewBooking = (callback) => {
  if (socket) socket.on('new_booking', callback);
};

export const onQuotationAccepted = (callback) => {
  if (socket) socket.on('quotation_accepted', callback);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;