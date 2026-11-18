const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();

router.use(checkLogin.isLogin);

const {
    myGalleryPage
} = require('../controllers/mygalleryControllers');

router.route('/').get(myGalleryPage);

module.exports = router;