const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const bookingCtrl = require('../controllers/bookingController');

router.post('/', auth(['farmer']), upload.array('land_images', 5), bookingCtrl.createBooking);
router.get('/farmer', auth(['farmer']), bookingCtrl.getFarmerBookings);
router.get('/nearby', auth(['driver']), bookingCtrl.getNearbyBookings);
router.get('/:id/quotations', auth(['farmer']), require('../controllers/quotationController').getQuotationsForBooking);
router.get('/driver', auth(['driver']), bookingCtrl.getDriverBookings);
router.put('/:bookingId/status', auth(['driver']), bookingCtrl.updateBookingStatus);
module.exports = router;