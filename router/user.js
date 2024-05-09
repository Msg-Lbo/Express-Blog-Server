const express = require('express');
const userController = require('../controller/user');
const router = express.Router();
const authToken = require('../utils/verify');
const getCaptcha = require('../utils/getCaptcha');
router.get('/get-all-user', authToken, userController.getAllUser);
router.get('/get-captcha', getCaptcha);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/get-userinfo', authToken, userController.getUserInfo)
module.exports = router;