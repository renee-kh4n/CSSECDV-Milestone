const userModel = require('../models/userModel');

function isAdmin(req, res, next) {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        return res.redirect('/profile');
    }
}

async function isNotBanned(req, res, next) {
    try {
        if (!req.session?.user?.id) {
            return res.redirect('/login');
        }

        const user = await userModel.getUserById(req.session.user.id);
        if (user?.is_banned) {
            req.session.errorMessage = 'You are banned from the forum.';
            return res.redirect('/profile');
        }

        return next();
    } catch (err) {
        console.error(err);
        return res.send('Server error');
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
    isGuest,
    isNotBanned
};
