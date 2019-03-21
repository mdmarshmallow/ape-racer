module.exports.getGame = (req, res) => {
    if (!req.session.name) {
        res.redirect('/');
    } else {
        res.render('game', {
            name: req.session.name,
            private: false,
            create: false
        });
    }
}

module.exports.getPrivateGame = (req, res) => {
    if (!req.session.name) {
        res.redirect('/');
    } else {
        res.render('game', {
            name: req.session.name,
            private: true,
            create: true
        });
    }
}

module.exports.joinRoom = (req, res) => {
    if (!req.session.name) {
        res.redirect('/');
    } else {
        res.render('game', {
            name: req.session.name,
            private: true,
            create: false,
            code: req.query.roomCode.trim()
        });
    } 
}