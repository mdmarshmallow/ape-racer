module.exports.getLandingPage = (req, res) => {
    res.render('landing-page');
}

module.exports.postLandingPage = (req, res) => {
    req.session.name = req.body.name;
    res.redirect('/home');
}