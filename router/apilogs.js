const express = require('express');
const router = express.Router();
const { getApiLogs } = require('../controller/apilogs');
const authToken = require('../utils/verify');

// 获取API日志
router.get('/', authToken, getApiLogs);

module.exports = router;
