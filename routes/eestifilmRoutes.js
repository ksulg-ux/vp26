const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmidLisa,
	eestifilmidPost,
	eestifilmZanrLisa,
	eestifilmZanrPost,
	lisaSeos,
	lisaSeosPost,
	kuvaSeosed
} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/film_inimesed').get(eestifilmInimesed);

router.route('/lisa_film_inimesed').get(eestifilmInimesedLisa);

router.route('/lisa_film_inimesed').post(eestifilmInimesedLisaPost);

router.route('/lisa_film').get(eestifilmidLisa);

router.route('/lisa_film').post(eestifilmidPost);

router.route('/lisa_zanr').get(eestifilmZanrLisa);

router.route('/lisa_zanr').post(eestifilmZanrPost);

router.route('/lisa_seos').get(lisaSeos);

router.route('/lisa_seos').post(lisaSeosPost);

router.route('/seosed').get(kuvaSeosed);

module.exports = router;