const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const driverCtrl = require('../controllers/driverController');

// Upload documents (multiple fields)
router.post(
  '/documents',
  auth(['driver']),
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'license', maxCount: 1 },
    { name: 'rc', maxCount: 1 }
  ]),
  driverCtrl.uploadDocuments
);

router.get('/documents', auth(['driver']), driverCtrl.getMyDocuments);

module.exports = router;