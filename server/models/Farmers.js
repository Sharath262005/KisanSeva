module.exports = `
CREATE TABLE IF NOT EXISTS farmers (
  user_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  language VARCHAR(20) DEFAULT 'hi',
  profile_photo VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;