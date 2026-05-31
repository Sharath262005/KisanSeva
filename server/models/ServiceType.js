module.exports = `
CREATE TABLE IF NOT EXISTS service_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  base_unit VARCHAR(20) DEFAULT 'acre'
) ENGINE=InnoDB;
`;