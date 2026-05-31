module.exports = `
CREATE TABLE IF NOT EXISTS disputes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  raised_by INT NOT NULL,
  against_user_id INT NOT NULL,
  reason TEXT,
  status ENUM('open','under_review','resolved','closed') DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (raised_by) REFERENCES users(id),
  FOREIGN KEY (against_user_id) REFERENCES users(id)
) ENGINE=InnoDB;
`;