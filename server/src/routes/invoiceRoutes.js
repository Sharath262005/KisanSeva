const router = require('express').Router();
const auth = require('../middleware/auth');
const invoiceCtrl = require('../controllers/invoiceController');
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  // Try query token first, then header
  const token = req.query.token || (req.header('Authorization')?.startsWith('Bearer ') ? req.header('Authorization').split(' ')[1] : null);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
//router.get('/:invoiceId/download', auth(['farmer']), invoiceCtrl.getInvoice);
router.get('/:invoiceId/download', optionalAuth, invoiceCtrl.getInvoice);
router.get('/farmer', auth(['farmer']), invoiceCtrl.listFarmerInvoices);

module.exports = router;