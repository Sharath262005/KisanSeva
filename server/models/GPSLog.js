module.exports = `
CREATE TABLE IF NOT EXISTS gps_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;