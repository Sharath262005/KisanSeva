const router = require('express').Router();
const auth = require('../middleware/auth');
const paymentCtrl = require('../controllers/paymentController');

router.post('/create-order', auth(['farmer']), paymentCtrl.createOrder);
router.post('/verify', auth(['farmer']), paymentCtrl.verifyPayment);
router.post('/mock', auth(['farmer']), paymentCtrl.mockPayment);

module.exports = router;