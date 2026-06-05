const pool = require('../config/db');

// ---------- Driver Approval ----------
exports.getUnapprovedDrivers = async (req, res) => {
  try {
    const [drivers] = await pool.query(
      `SELECT d.*, u.mobile, u.created_at AS registered_at
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.is_approved = FALSE
       ORDER BY u.created_at ASC`
    );
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
  }
};

exports.approveDriver = async (req, res) => {
  const { driverId } = req.params;
  try {
    await pool.query('UPDATE drivers SET is_approved = TRUE WHERE user_id = ?', [driverId]);
    res.json({ message: 'Driver approved' });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

exports.rejectDriver = async (req, res) => {
  // Soft reject: keep driver but mark as not approved (already false), or delete? We'll just leave as unapproved.
  // For now, we can implement a simple delete of the driver record, but better to keep and add a 'rejected' status later.
  // For simplicity, we just return a message; you could also update the driver row with a rejection reason.
  res.json({ message: 'Driver rejected (not implemented fully)' });
};

// ---------- Survey Management ----------
exports.createSurvey = async (req, res) => {
  const { year, start_date, end_date } = req.body;
  const adminId = req.user.id;
  try {
    const [existing] = await pool.query('SELECT id FROM yearly_surveys WHERE year = ?', [year]);
    if (existing.length > 0) return res.status(409).json({ message: 'Survey for this year already exists' });

    const [result] = await pool.query(
      'INSERT INTO yearly_surveys (year, is_open, start_date, end_date, created_by) VALUES (?, TRUE, ?, ?, ?)',
      [year, start_date, end_date, adminId]
    );
    res.status(201).json({ message: 'Survey created', surveyId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Survey creation failed', error: error.message });
  }
};

exports.toggleSurveyStatus = async (req, res) => {
  const { surveyId } = req.params;
  const { is_open } = req.body;  // boolean
  try {
    await pool.query('UPDATE yearly_surveys SET is_open = ? WHERE id = ?', [is_open, surveyId]);
    res.json({ message: `Survey ${is_open ? 'opened' : 'closed'}` });
  } catch (error) {
    res.status(500).json({ message: 'Toggle failed', error: error.message });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const [surveys] = await pool.query('SELECT * FROM yearly_surveys ORDER BY year DESC');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch surveys', error: error.message });
  }
};

// ---------- Survey Responses & Analytics ----------
exports.getSurveyAnalytics = async (req, res) => {
  const { surveyId } = req.params;
  try {
    // Average price per service type across all responses
    const [serviceAverages] = await pool.query(
      `SELECT st.name AS service_name, AVG(sr.suggested_price) AS avg_price,
              MIN(sr.suggested_price) AS min_price, MAX(sr.suggested_price) AS max_price,
              COUNT(sr.id) AS response_count
       FROM survey_responses sr
       JOIN service_types st ON sr.service_type_id = st.id
       WHERE sr.survey_id = ?
       GROUP BY sr.service_type_id`,
      [surveyId]
    );

    // District-wise average
    const [districtAverages] = await pool.query(
      `SELECT f.district, st.name AS service_name, AVG(sr.suggested_price) AS avg_price
       FROM survey_responses sr
       JOIN farmers f ON sr.user_id = f.user_id
       JOIN service_types st ON sr.service_type_id = st.id
       WHERE sr.survey_id = ? AND sr.role = 'farmer'
       GROUP BY f.district, sr.service_type_id`,
      [surveyId]
    );

    res.json({ serviceAverages, districtAverages });
  } catch (error) {
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
};

// ---------- Approved Pricing ----------
exports.publishPrices = async (req, res) => {
  const { surveyId } = req.params;
  const { prices } = req.body;  // array of { service_type_id, standard_price, min_price, max_price, district, village }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete existing approved prices for this survey (optional, we'll just insert new)
    await connection.query('DELETE FROM approved_service_prices WHERE survey_id = ?', [surveyId]);

    for (const p of prices) {
      await connection.query(
        `INSERT INTO approved_service_prices (survey_id, service_type_id, standard_price, min_price, max_price, effective_from, district, village)
         VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
        [surveyId, p.service_type_id, p.standard_price, p.min_price, p.max_price, p.district || null, p.village || null]
      );
    }

    await connection.commit();
    res.json({ message: 'Prices published successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Publishing failed', error: error.message });
  }
};

exports.getApprovedPrices = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ap.*, st.name AS service_name
       FROM approved_service_prices ap
       JOIN service_types st ON ap.service_type_id = st.id
       ORDER BY ap.effective_from DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prices', error: error.message });
  }
};

// Get dashboard stats (total farmers, drivers, active bookings, etc.)
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ farmerCount }]] = await pool.query('SELECT COUNT(*) AS farmerCount FROM farmers');
    const [[{ driverCount }]] = await pool.query('SELECT COUNT(*) AS driverCount FROM drivers');
    const [[{ activeBookings }]] = await pool.query(
      `SELECT COUNT(*) AS activeBookings FROM bookings WHERE status IN ('accepted','in_progress','driver_on_way')`
    );
    const [[{ pendingDrivers }]] = await pool.query('SELECT COUNT(*) AS pendingDrivers FROM drivers WHERE is_approved = FALSE');
    res.json({ farmerCount, driverCount, activeBookings, pendingDrivers });
  } catch (error) {
    res.status(500).json({ message: 'Stats failed', error: error.message });
  }
};
exports.getApprovedDrivers = async (req, res) => {
  try {
    const [drivers] = await pool.query(
      `SELECT d.*, u.mobile, u.created_at AS registered_at
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.is_approved = TRUE
       ORDER BY u.created_at DESC`
    );
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch approved drivers', error: error.message });
  }
};