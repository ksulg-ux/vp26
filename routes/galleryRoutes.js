const express = require("express");
const router = express.Router();
const galleryControllers = require("../controllers/galleryControllers");

router.get("/", galleryControllers.gallery);

module.exports = router;