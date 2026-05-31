module.exports = `
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  driver_id INT NOT NULL,
  vehicle_id INT,
  price DECIMAL(10,2) NOT NULL,
  estimated_hours INT,
  notes TEXT,
  status ENUM('pending','accepted','rejected','expired') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(user_id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB;
`;