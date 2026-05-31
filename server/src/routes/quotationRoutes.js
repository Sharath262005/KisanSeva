const router = require('express').Router();
const auth = require('../middleware/auth');
const quotationCtrl = require('../controllers/quotationController');

router.post('/', auth(['driver']), quotationCtrl.createQuotation);
router.put('/:quotationId/accept', auth(['farmer']), quotationCtrl.acceptQuotation);

module.exports = router;