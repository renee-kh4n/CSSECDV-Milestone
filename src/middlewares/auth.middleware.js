function isAdmin(req, res, next) {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        return res.redirect('/profile');
    }
}

function isLoggedin(req, res, next) {
    if (req.session.user) {
        res.set('Cache-Control', 'no-store');
        return next();
    } else {
        return res.redirect('/login');
    }
}

function isGuest(req, res, next) {
    if (req.session.user) {
        return res.redirect('/profile');
    } else {
        res.set('Cache-Control', 'no-store');
        return next();
    }
}

module.exports = {
    isLoggedin,
    isAdmin,
    isGuest
};
