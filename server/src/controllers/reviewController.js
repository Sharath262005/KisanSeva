const pool = require('../config/db');

// Submit a review (farmer only)
exports.createReview = async (req, res) => {
  const farmerId = req.user.id;
  const { booking_id, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const connection = await pool.getConnection();
  try {
    // Check that booking is completed and belongs to this farmer
    const [bookings] = await connection.query(
      `SELECT driver_id FROM bookings WHERE id = ? AND farmer_id = ? AND status = 'completed'`,
      [booking_id, farmerId]
    );
    if (bookings.length === 0) {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Prevent duplicate reviews
    const [existing] = await connection.query(
      `SELECT id FROM reviews WHERE booking_id = ? AND farmer_id = ?`,
      [booking_id, farmerId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already reviewed this booking' });
    }

    const driverId = bookings[0].driver_id;
    await connection.query(
      `INSERT INTO reviews (booking_id, farmer_id, driver_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
      [booking_id, farmerId, driverId, rating, comment || null]
    );

    res.status(201).json({ message: 'Review submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Review failed', error: error.message });
  } finally {
    connection.release();
  }
};

// Get reviews by farmer (to check which bookings were reviewed)
exports.getFarmerReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT booking_id, rating, comment FROM reviews WHERE farmer_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};