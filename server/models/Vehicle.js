module.exports = `
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  vehicle_type ENUM('tractor','harvester','plough','rotavator','seeder','drone_sprayer','water_tanker','transport') NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  reg_number VARCHAR(50) UNIQUE NOT NULL,
  capacity VARCHAR(50),
  service_radius_km INT DEFAULT 20,
  is_available BOOLEAN DEFAULT TRUE,
  vehicle_photo VARCHAR(255),
  rc_document VARCHAR(255),
  FOREIGN KEY (driver_id) REFERENCES drivers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;