const router = require('express').Router();
const auth = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

// All admin routes require 'admin' role
router.use(auth(['admin']));

// Driver Approval
router.get('/drivers/unapproved', adminCtrl.getUnapprovedDrivers);
router.put('/drivers/:driverId/approve', adminCtrl.approveDriver);
router.put('/drivers/:driverId/reject', adminCtrl.rejectDriver);

// Surveys
router.post('/surveys', adminCtrl.createSurvey);
router.put('/surveys/:surveyId/toggle', adminCtrl.toggleSurveyStatus);
router.get('/surveys', adminCtrl.getSurveys);
router.get('/surveys/:surveyId/analytics', adminCtrl.getSurveyAnalytics);

// Pricing
router.post('/surveys/:surveyId/publish', adminCtrl.publishPrices);
router.get('/prices', adminCtrl.getApprovedPrices);

// Stats
router.get('/stats', adminCtrl.getDashboardStats);

router.get('/drivers/approved', adminCtrl.getApprovedDrivers);

module.exports = router;