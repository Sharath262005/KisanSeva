const pool = require('../config/db');

// Upload driver documents (Aadhaar, license, RC)
exports.uploadDocuments = async (req, res) => {
  const driverId = req.user.id;

  // Multer stores files in req.files; normalize paths to use forward slashes
  const aadhaar = req.files?.aadhaar?.[0]?.path?.replace(/\\/g, '/') || null;
  const license = req.files?.license?.[0]?.path?.replace(/\\/g, '/') || null;
  const rc = req.files?.rc?.[0]?.path?.replace(/\\/g, '/') || null;

  try {
    await pool.query(
      `UPDATE drivers SET aadhaar = COALESCE(?, aadhaar), driving_license = COALESCE(?, driving_license), rc_document = COALESCE(?, rc_document) WHERE user_id = ?`,
      [aadhaar, license, rc, driverId]
    );
    res.json({ message: 'Documents uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Get own documents (driver)
exports.getMyDocuments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT aadhaar, driving_license, rc_document FROM drivers WHERE user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};