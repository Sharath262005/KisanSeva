import { io } from 'socket.io-client';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '');

let socket;

export const connectSocket = (userId) => {
  socket = io(SOCKET_URL);
  socket.emit('join', userId);
  return socket;
};

export const getSocket = () => socket;

export const onNewBooking = (callback) => {
  if (socket) socket.on('new_booking', callback);
};

export const onQuotationAccepted = (callback) => {
  if (socket) socket.on('quotation_accepted', callback);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};