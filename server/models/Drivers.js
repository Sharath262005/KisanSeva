module.exports = `
CREATE TABLE IF NOT EXISTS drivers (
  user_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  aadhaar VARCHAR(20) NOT NULL,
  driving_license VARCHAR(50) NOT NULL,
  profile_photo VARCHAR(255),
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  is_approved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;