const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();

router.use(checkLogin.isLogin);

const {
    galleryPage,
    myGalleryPage
} = require('../controllers/galleryControllers');

router.route('/').get(galleryPage);

router.route('/mygallery').get(myGalleryPage);

module.exports = router;