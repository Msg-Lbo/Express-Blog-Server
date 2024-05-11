const express = require('express');
const router = express.Router();
const authToken = require('../utils/verify');
const { createTables, createSuperuser } = require('../utils/install')

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
router.get('/create-tables', createTables, () => { });
router.post('/create-superuser', createSuperuser, () => { });

router.get('/test', authToken, (req, res) => {
    console.log(req.session);
    res.json({
        code: 200,
        msg: 'success',
    })
});

module.exports = router;