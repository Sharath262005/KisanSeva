const router = require('express').Router();
const auth = require('../middleware/auth');
const surveyCtrl = require('../controllers/surveyController');

// Both farmers and drivers can submit survey responses
router.post('/:survey_id/responses', auth(['farmer', 'driver']), surveyCtrl.submitResponse);
router.get('/active', auth(['farmer', 'driver']), surveyCtrl.getActiveSurvey);

module.exports = router;