const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const navigationsController = require('../controller/navigations');

router.post('/save-navigation', authToken, navigationsController.saveNav);
router.get('/get-all-navigations', authToken, navigationsController.getAllNav);
router.get('/get-navigation', navigationsController.getNavByStatus);
router.post('/update-navigation', authToken, navigationsController.updateNav);
router.post('/delete-navigation', authToken, navigationsController.deleteNav);

module.exports = router;