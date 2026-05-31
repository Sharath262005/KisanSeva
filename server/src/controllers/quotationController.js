const pool = require('../config/db');
const { validatePrice } = require('../services/priceValidator.js');

// Driver submits a quotation for a booking
exports.createQuotation = async (req, res) => {
  const driverId = req.user.id;
  const { booking_id, vehicle_id, price, estimated_hours, notes } = req.body;

  try {
    // Get booking details to know service type and farmer location
    const [bookingRows] = await pool.query(
      `SELECT b.service_type_id, f.village, f.district 
       FROM bookings b 
       JOIN farmers f ON b.farmer_id = f.user_id 
       WHERE b.id = ? AND b.status = 'pending'`,
      [booking_id]
    );
    if (bookingRows.length === 0) {
      return res.status(400).json({ message: 'Booking not found or not available' });
    }

    const { service_type_id, village, district } = bookingRows[0];

    // Validate price against approved range
    const validation = await validatePrice(service_type_id, price, district, village);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message, range: validation.range });
    }

    // Insert quotation
    const [result] = await pool.query(
      `INSERT INTO quotations (booking_id, driver_id, vehicle_id, price, estimated_hours, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, driverId, vehicle_id, price, estimated_hours, notes]
    );

    // Optionally: update booking status to 'quotation_received' if first quotation
    await pool.query(
      `UPDATE bookings SET status = 'quotation_received' WHERE id = ? AND status = 'pending'`,
      [booking_id]
    );

    res.status(201).json({ message: 'Quotation submitted', quotationId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Quotation failed', error: error.message });
  }
};

// Get all quotations for a booking (farmer view)
exports.getQuotationsForBooking = async (req, res) => {
  const bookingId = req.params.id;   // route is /:id/quotations
  try {
    const [rows] = await pool.query(
      `SELECT q.*, d.name AS driver_name, NULL AS rating_avg, v.model AS vehicle_model, v.brand AS vehicle_brand
       FROM quotations q
       JOIN drivers d ON q.driver_id = d.user_id
       LEFT JOIN vehicles v ON q.vehicle_id = v.id
       WHERE q.booking_id = ?
       ORDER BY q.created_at ASC`,
      [bookingId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quotations', error: error.message });
  }
};

// Farmer accepts a quotation
exports.acceptQuotation = async (req, res) => {
  const farmerId = req.user.id;
  const { quotationId } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get quotation and booking
    const [quotes] = await connection.query(
      `SELECT q.*, b.farmer_id FROM quotations q JOIN bookings b ON q.booking_id = b.id WHERE q.id = ? AND b.farmer_id = ?`,
      [quotationId, farmerId]
    );
    if (quotes.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Not allowed to accept this quotation' });
    }
    const quote = quotes[0];

    // Update booking: set driver, accepted quotation, status
    await connection.query(
      `UPDATE bookings SET driver_id = ?, accepted_quotation_id = ?, status = 'accepted' WHERE id = ?`,
      [quote.driver_id, quotationId, quote.booking_id]
    );

    // Update other quotations for this booking to 'rejected' (optional)
    await connection.query(
      `UPDATE quotations SET status = 'rejected' WHERE booking_id = ? AND id != ?`,
      [quote.booking_id, quotationId]
    );

    // Mark the accepted quotation as 'accepted'
    await connection.query(`UPDATE quotations SET status = 'accepted' WHERE id = ?`, [quotationId]);

    await connection.commit();
    // Notify driver that quotation was accepted
    const io = require('../sockets').getIO();
    io.to(`user_${quote.driver_id}`).emit('quotation_accepted', {
      booking_id: quote.booking_id,
      message: 'Your quotation was accepted!'
    });
    res.json({ message: 'Quotation accepted, booking confirmed' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Acceptance failed', error: error.message });
  }
};