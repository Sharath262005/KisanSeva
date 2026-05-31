const razorpay = require('../config/razorpay');
const pool = require('../config/db');
const crypto = require('crypto');

// Create Razorpay order
exports.createOrder = async (req, res) => {
  const { booking_id } = req.body;
  try {
    // Get booking and accepted quotation price
    const [bookings] = await pool.query(
      `SELECT b.*, q.price AS quoted_price
       FROM bookings b
       JOIN quotations q ON b.accepted_quotation_id = q.id
       WHERE b.id = ? AND b.farmer_id = ? AND b.status = 'accepted'`,
      [booking_id, req.user.id]
    );
    if (bookings.length === 0) return res.status(400).json({ message: 'Booking not eligible for payment' });

    const booking = bookings[0];
    const amount = Math.round(booking.quoted_price * 100); // amount in paise

    const options = {
      amount,
      currency: 'INR',
      receipt: `booking_${booking.id}`,
      notes: { booking_id: booking.id },
    };

    const order = await razorpay.orders.create(options);

    // Save order in payments table
    await pool.query(
      `INSERT INTO payments (invoice_id, razorpay_order_id, amount, status)
       VALUES (NULL, ?, ?, 'created')`,
      [order.id, booking.quoted_price]
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSign !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update payment record
    await connection.query(
      `UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'captured'
       WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    // Create invoice (we'll generate PDF later, but create invoice record now)
    const invoiceNumber = 'INV-' + Date.now();
    const [bookingRows] = await connection.query(
      `SELECT b.*, q.price FROM bookings b
       JOIN quotations q ON b.accepted_quotation_id = q.id
       WHERE b.id = ?`,
      [booking_id]
    );
    const booking = bookingRows[0];
    const tax = Math.round(booking.price * 0.18); // 18% tax example
    const total = booking.price + tax;

    const [invResult] = await connection.query(
      `INSERT INTO invoices (booking_id, invoice_number, amount, tax_amount, total_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, 'paid')`,
      [booking_id, invoiceNumber, booking.price, tax, total]
    );

    // Update the payment record with invoice_id
    await connection.query(
      `UPDATE payments SET invoice_id = ? WHERE razorpay_order_id = ?`,
      [invResult.insertId, razorpay_order_id]
    );

    // Update booking status to 'completed' (or keep 'accepted' until driver marks complete)
    // await connection.query(`UPDATE bookings SET status = 'completed' WHERE id = ?`, [booking_id]);

    await connection.commit();
    res.json({ message: 'Payment verified', invoiceId: invResult.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

exports.mockPayment = async (req, res) => {
  const { booking_id } = req.body;
  const connection = await pool.getConnection();
  try {
    // 1. Get booking and price
    const [bookings] = await connection.query(
      `SELECT b.*, q.price FROM bookings b
       JOIN quotations q ON b.accepted_quotation_id = q.id
       WHERE b.id = ? AND b.farmer_id = ? AND b.status = 'accepted'`,
      [booking_id, req.user.id]
    );
    if (bookings.length === 0) return res.status(400).json({ message: 'Booking not eligible' });

    const booking = bookings[0];
    const tax = Math.round(booking.price * 0.18);   // 18% tax
    const total = booking.price + tax;

    await connection.beginTransaction();

    // 2. Create invoice first (so we have an invoice_id for the payment)
    const invoiceNumber = 'INV-' + Date.now();
    const [invResult] = await connection.query(
      `INSERT INTO invoices (booking_id, invoice_number, amount, tax_amount, total_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, 'paid')`,
      [booking_id, invoiceNumber, booking.price, tax, total]
    );
    const invoiceId = invResult.insertId;

    // 3. Now insert payment with the actual invoice_id
    await connection.query(
      `INSERT INTO payments (invoice_id, razorpay_order_id, razorpay_payment_id, amount, status)
       VALUES (?, 'mock_order', 'mock_payment', ?, 'captured')`,
      [invoiceId, booking.price]
    );

    await connection.commit();
    res.json({ message: 'Mock payment successful', invoiceId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Mock payment failed', error: error.message });
  }
};