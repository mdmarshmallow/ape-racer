const express = require('express');
const homeController = require('../controllers/homeController');
const router = express.Router();

router.get('/leaderboard', homeController.getLeaderBoard);
router.get('/', homeController.getHomePage);

module.exports = router;