module.exports = `
CREATE TABLE IF NOT EXISTS survey_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('farmer','driver') NOT NULL,
  service_type_id INT NOT NULL,
  suggested_price DECIMAL(10,2),
  fuel_cost_opinion DECIMAL(10,2),
  labor_cost_opinion DECIMAL(10,2),
  maintenance_cost DECIMAL(10,2),
  seasonal_difficulty INT COMMENT 'scale 1-10',
  prev_year_comparison VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES yearly_surveys(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id)
) ENGINE=InnoDB;
`;