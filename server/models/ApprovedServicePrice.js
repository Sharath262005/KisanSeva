module.exports = `
CREATE TABLE IF NOT EXISTS approved_service_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  service_type_id INT NOT NULL,
  standard_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  district VARCHAR(100),
  village VARCHAR(100),
  FOREIGN KEY (survey_id) REFERENCES yearly_surveys(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id)
) ENGINE=InnoDB;
`;