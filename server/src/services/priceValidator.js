const pool = require('../config/db');

async function validatePrice(serviceTypeId, price, district, village) {
  // Try to find most specific approved price (village > district > global)
  const [rows] = await pool.query(
    `SELECT min_price, max_price, standard_price FROM approved_service_prices
     WHERE service_type_id = ? AND (village = ? OR district = ? OR (village IS NULL AND district IS NULL))
     ORDER BY village DESC, district DESC
     LIMIT 1`,
    [serviceTypeId, village, district]
  );

  if (rows.length === 0) {
    return { valid: false, message: 'No approved pricing found for this service in your area' };
  }

  const { min_price, max_price } = rows[0];
  if (price < min_price || price > max_price) {
    return {
      valid: false,
      message: `Price must be between ₹${min_price} and ₹${max_price}`,
      range: { min: min_price, max: max_price }
    };
  }

  return { valid: true, range: { min: min_price, max: max_price } };
}

module.exports = { validatePrice };