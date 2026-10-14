const express = require('express');
const router = express.Router();

const {
	registervisit,
	registervisitPost,
	lastvisit

} = require('../controllers/visitControllers');

router.route('/regvisit').get(registervisit);

router.route('/regvisit').post(registervisitPost);

router.route('/lastvisit').get(lastvisit);

module.exports = router;