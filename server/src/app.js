require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => res.json({ message: 'KisanSeva API' }));

// ---------- API Routes ----------
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/surveys', require('./routes/surveyRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
// Future routes will be added here, e.g.:
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/surveys', require('./routes/surveyRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

module.exports = app;