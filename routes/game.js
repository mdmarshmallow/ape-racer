const express = require('express');
const gameController = require('../controllers/gameController');
const router = express.Router();

router.get('/createroom', gameController.getPrivateGame);
router.get('/joinroom', gameController.joinRoom);
router.get('/', gameController.getGame);

module.exports = router;