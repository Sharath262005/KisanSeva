const pool = require('../config/db');

// Create a new service request (farmer)
exports.createBooking = async (req, res) => {
  const farmerId = req.user.id;
  const {
    service_type_id, land_area, land_dimensions,
    latitude, longitude, address_text, preferred_date, urgency, description
  } = req.body;

  // Land images from multer upload
  const landImages = req.files ? JSON.stringify(req.files.map(f => f.path)) : '[]';

  try {
    const [result] = await pool.query(
      `INSERT INTO bookings 
       (farmer_id, service_type_id, land_area, land_dimensions, latitude, longitude, address_text, preferred_date, urgency, description, land_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [farmerId, service_type_id, land_area, land_dimensions, latitude, longitude, address_text, preferred_date, urgency, description, landImages]
    );

    res.status(201).json({ message: 'Service request created', bookingId: result.insertId });
    const io = require('../sockets').getIO();
    io.emit('new_booking', {
      booking_id: result.insertId,
      service_type_id,
      latitude,
      longitude,
      address_text,
      message: 'A new service request is available.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Get all bookings for a farmer
exports.getFarmerBookings = async (req, res) => {
  const farmerId = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT b.*, st.name AS service_name 
       FROM bookings b 
       JOIN service_types st ON b.service_type_id = st.id
       WHERE b.farmer_id = ?
       ORDER BY b.created_at DESC`,
      [farmerId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

// Get nearby bookings (for driver)
exports.getNearbyBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, st.name AS service_name
       FROM bookings b
       JOIN service_types st ON b.service_type_id = st.id
       WHERE b.status = 'pending'
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};
// Get driver's bookings (accepted and beyond)
exports.getDriverBookings = async (req, res) => {
  const driverId = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT b.*, st.name AS service_name, f.name AS farmer_name, f.village AS farmer_village
       FROM bookings b
       JOIN service_types st ON b.service_type_id = st.id
       JOIN farmers f ON b.farmer_id = f.user_id
       WHERE b.driver_id = ? AND b.status IN ('accepted', 'driver_on_way', 'in_progress', 'completed')
       ORDER BY b.preferred_date ASC`,
      [driverId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch driver bookings', error: error.message });
  }
};