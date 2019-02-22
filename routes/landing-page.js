const express = require('express');
const landingPageController = require('../controllers/landingPageController');
const router = express.Router();

router.get('/', landingPageController.getLandingPage);

module.exports = router;