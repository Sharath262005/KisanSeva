const router = require('express').Router();
const auth = require('../middleware/auth');
const reviewCtrl = require('../controllers/reviewController');

router.post('/', auth(['farmer']), reviewCtrl.createReview);
router.get('/farmer', auth(['farmer']), reviewCtrl.getFarmerReviews);

module.exports = router;