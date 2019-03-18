//this will need to choose to either join or create a game (possibly)
module.exports.getGame = (req, res) => {
    res.render('game', {
        name: req.session.name,
        private: false,
        create: false
    });
}

module.exports.getPrivateGame = (req, res) => {
    res.render('game', {
        name: req.session.name,
        private: true,
        create: true
    });
}

module.exports.joinRoom = (req, res) => {
    res.render('game', {
        name: req.session.name,
        private: true,
        create: false,
        code: req.query.roomCode.trim()
    });
}