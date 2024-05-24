const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const createTablesController = require('../utils/install')

router.use('/user', require('./user'));
router.use('/article', require('./article'));
router.use('/category', require('./category'));
router.use('/friend', require('./friend'));
router.use('/comment', require('./comment'));
router.use('/image', require('./image'));
router.use('/settings', require('./settings'));
router.use('/navigations', require('./navigations'));
router.use('/tags', require('./tag'));
router.use('/feed', require('../utils/rss'));
router.get('/refreshCaptcha', require('../utils/svgCode'));
router.get('/getEnv', createTablesController.checkInstallLock, createTablesController.getEnvData);
router.get('/testEmailService', createTablesController.checkInstallLock, require('../utils/getCaptcha'))
router.post('/verifyEmailCode', createTablesController.checkInstallLock, createTablesController.verifyEmailCode)
router.get('/testConnection', createTablesController.checkInstallLock, createTablesController.checkConnection)
router.post('/installBackend', createTablesController.checkInstallLock, createTablesController.createTables);

router.get('/test', authToken, (req, res) => {
    console.log(req.session);
    res.json({
        code: 200,
        msg: 'success',
    })
});

module.exports = router;