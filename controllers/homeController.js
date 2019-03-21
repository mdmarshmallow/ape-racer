const leaderboard_db = require('../models/leaderboard');

module.exports.getHomePage = (req, res) => {
    if (!req.session.name) {
        res.redirect('/');
    } else if (req.session.name.length > 7) {
        res.redirect('/');
    } else {
        res.render('home', {
            name: req.session.name
        });
    }
}

module.exports.getLeaderBoard = (req, res) => {
    leaderboard_db.retrieveLeaderBoard(leaderboard => {
        res.render('leaderboard', {
            list: leaderboard
        });
    });
}