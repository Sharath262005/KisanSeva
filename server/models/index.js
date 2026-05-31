const pool = require('../config/db');

const models = [
  require('./User'),
  require('./Farmer'),
  require('./Driver'),
  require('./ServiceType'),
  require('./Vehicle'),
  require('./Booking'),
  require('./Quotation'),
  require('./Invoice'),
  require('./Payment'),
  require('./Review'),
  require('./Dispute'),
  require('./Notification'),
  require('./GPSLog'),
  require('./YearlySurvey'),
  require('./SurveyResponse'),
  require('./ApprovedServicePrice'),
];

async function createTables() {
  const connection = await pool.getConnection();
  try {
    for (const sql of models) {
      await connection.query(sql);
    }
    console.log('✅ All tables created successfully.');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    connection.release();
    process.exit();
  }
}

createTables();