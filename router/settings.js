const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const settingsController = require('../controller/settings');

router.post('/save-settings', authToken, settingsController.saveSettings);
router.get('/get-settings', settingsController.getSettings);
router.get('/get-summary', settingsController.getSummary);
router.post('/save-friend-template', authToken, settingsController.saveFriendTemplate);
router.post('/save-about', authToken, settingsController.saveAbout);
module.exports = router;