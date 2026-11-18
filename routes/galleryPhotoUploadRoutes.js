const express = require('express');
const multer = require('multer');

const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);
//seadistame multer vahevara faile üles laadima kindlasse kataloogi
const upload = multer({dest: './public/gallery/orig/'});
//saab määrata ka lubatud failitüüpe, failimahtu jms

//kasutatavad kontrollerid
const {
	galleryPhotoUpload,
	galleryPhotoUploadPost
} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);

router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;