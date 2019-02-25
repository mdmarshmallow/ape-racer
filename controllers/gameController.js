const wiki = require('wikijs').default;

//this will need to choose to either join or create a game
module.exports.getGame = (req, res) => {
    res.render('game', {
        name: req.session.name
    });
}