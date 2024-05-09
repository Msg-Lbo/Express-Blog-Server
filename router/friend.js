const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const friendsController = require('../controller/friend');


router.post('/apply-friend', friendsController.applyFriend);
router.post('/allow-friend', authToken, friendsController.allowFriend);
router.post('/refuse-friend', authToken, friendsController.refuseFriend);
router.post('/delete-friend', authToken, friendsController.deleteFriend);
router.post('/update-friend', authToken, friendsController.updateFriend);
router.get('/get-all-friend', authToken, friendsController.getAllFriend);
router.get('/get-friend', friendsController.getAllowFriends);
module.exports = router;