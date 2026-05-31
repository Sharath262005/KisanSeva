module.exports = `
CREATE TABLE IF NOT EXISTS yearly_surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year YEAR UNIQUE NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;
`;