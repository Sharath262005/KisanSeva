module.exports = `
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  service_type_id INT NOT NULL,
  land_area DECIMAL(5,2),
  land_dimensions VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address_text VARCHAR(255),
  preferred_date DATE,
  urgency ENUM('normal','high','emergency') DEFAULT 'normal',
  description TEXT,
  land_images JSON,
  status ENUM('pending','quotation_received','accepted','driver_on_way','in_progress','completed','cancelled') DEFAULT 'pending',
  driver_id INT,
  accepted_quotation_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(user_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(user_id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id)
) ENGINE=InnoDB;
`;