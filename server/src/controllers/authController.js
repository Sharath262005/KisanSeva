const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ---------- Register ----------
exports.register = async (req, res) => {
  const { mobile, password, role, name, village, district, state, language } = req.body;

  // Basic validation
  if (!mobile || !password || !role || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!['farmer', 'driver'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if mobile already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert into users
    const [userResult] = await connection.query(
      'INSERT INTO users (mobile, password_hash, role) VALUES (?, ?, ?)',
      [mobile, password_hash, role]
    );
    const userId = userResult.insertId;

    // Insert into role-specific table
    if (role === 'farmer') {
      await connection.query(
        'INSERT INTO farmers (user_id, name, village, district, state, preferred_language) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, village || null, district || null, state || null, language || 'hi']
      );
    } else if (role === 'driver') {
      // For driver, we later require document uploads, but for now minimal insert
      await connection.query(
        'INSERT INTO drivers (user_id, name, village, district, state) VALUES (?, ?, ?, ?, ?)',
        [userId, name, village || null, district || null, state || null]
      );
    }

    await connection.commit();

    // Generate tokens (immediate login after register)
    const tokens = generateTokens(userId, role);
    res.status(201).json({
      message: 'Registration successful',
      ...tokens,
      user: { id: userId, role }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    connection.release();
  }
};

// ---------- Login ----------
exports.login = async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id, user.role);

    // Store refresh token in DB
    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [tokens.refreshToken, user.id]);

    res.json({
      message: 'Login successful',
      ...tokens,
      user: { id: user.id, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ---------- Refresh Token ----------
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Refresh token required' });

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in DB for this user (to allow revocation)
    const [rows] = await pool.query('SELECT refresh_token FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0 || rows[0].refresh_token !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token (and optionally rotate refresh token)
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Optional: rotate refresh token (here we keep the same for simplicity, but best practice is to issue a new one)
    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, decoded.id]);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// ---------- Helper function ----------
function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}