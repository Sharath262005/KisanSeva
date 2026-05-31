const jwt = require('jsonwebtoken');

/**
 * @param {string[]} roles - allowed roles (e.g., ['farmer', 'driver']). If empty, any authenticated user passes.
 */
const auth = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;   // { id, role, iat, exp }

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

module.exports = auth;