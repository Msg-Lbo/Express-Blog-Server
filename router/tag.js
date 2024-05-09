const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const tagController = require('../controller/tag');

router.post('/save-tags', authToken, tagController.saveTags);
router.get('/get-tags', tagController.getTagList);
router.post('/delete-tag', authToken, tagController.deleteTag)
module.exports = router;