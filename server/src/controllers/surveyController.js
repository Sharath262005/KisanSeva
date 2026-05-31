const pool = require('../config/db');

// Submit or update a survey response (one per user per survey)
exports.submitResponse = async (req, res) => {
  const userId = req.user.id;
  const { survey_id } = req.params;
  const {
    service_type_id, suggested_price, fuel_cost_opinion, labor_cost_opinion,
    maintenance_cost, seasonal_difficulty, prev_year_comparison, reason
  } = req.body;

  const connection = await pool.getConnection();
  try {
    // Check if survey is open
    const [surveys] = await connection.query(
      'SELECT is_open FROM yearly_surveys WHERE id = ?',
      [survey_id]
    );
    if (surveys.length === 0 || !surveys[0].is_open) {
      return res.status(400).json({ message: 'Survey is not open for responses' });
    }

    // Check if user already has a response for this service in this survey
    const [existing] = await connection.query(
      `SELECT id FROM survey_responses 
       WHERE survey_id = ? AND user_id = ? AND service_type_id = ?`,
      [survey_id, userId, service_type_id]
    );

    if (existing.length > 0) {
      // Update existing response
      await connection.query(
        `UPDATE survey_responses SET
          suggested_price = ?, fuel_cost_opinion = ?, labor_cost_opinion = ?,
          maintenance_cost = ?, seasonal_difficulty = ?, prev_year_comparison = ?,
          reason = ?
         WHERE id = ?`,
        [suggested_price, fuel_cost_opinion, labor_cost_opinion, maintenance_cost,
         seasonal_difficulty, prev_year_comparison, reason, existing[0].id]
      );
      return res.json({ message: 'Response updated' });
    }

    // Insert new response
    await connection.query(
      `INSERT INTO survey_responses 
       (survey_id, user_id, role, service_type_id, suggested_price, fuel_cost_opinion,
        labor_cost_opinion, maintenance_cost, seasonal_difficulty, prev_year_comparison, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [survey_id, userId, req.user.role, service_type_id, suggested_price,
       fuel_cost_opinion, labor_cost_opinion, maintenance_cost, seasonal_difficulty,
       prev_year_comparison, reason]
    );
    res.status(201).json({ message: 'Response submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error: error.message });
  } finally {
    connection.release();
  }
};

// Get the active (open) survey for the current year
exports.getActiveSurvey = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM yearly_surveys WHERE is_open = TRUE AND YEAR(CURDATE()) = year LIMIT 1'
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No active survey' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch survey', error: error.message });
  }
};