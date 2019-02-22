module.exports.getHomePage = (req, res) => {
    if (!req.session.name) {
        res.redirect('/');
    } else {
        res.render('home', {
            name: req.session.name
        });
    }
}