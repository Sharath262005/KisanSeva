module.exports = `
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  farmer_id INT NOT NULL,
  driver_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (farmer_id) REFERENCES farmers(user_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(user_id)
) ENGINE=InnoDB;
`;