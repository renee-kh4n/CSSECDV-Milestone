const userModel = require('../models/userModel');
const logger = require('../logger');

function isAdmin(req, res, next) {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        logger.warn(
            `USER_DENIED | route=${req.originalUrl} | user=${req.session.user?.id} | ip=${req.ip}`
        );
        return res.redirect('/profile');
    }
}

async function isNotBanned(req, res, next) {
    try {
        if (!req.session?.user?.id) {
            return res.redirect('/login');
        }

        const user = await userModel.getUserById(req.session.user?.id);
        if (user?.is_banned) {
            logger.warn(
                `BANNED_USER_BLOCKED | userId=${req.session.user?.id} | ip=${req.ip}`
            );
            req.session.errorMessage = 'You are banned from the forum.';
            return res.redirect('/profile');
        }

        return next();
    } catch (err) {
        logger.warn(
            `BANNED_USER_ERROR | userId=${req.session.user?.id} | ip=${req.ip}`
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
}

function isLoggedin(req, res, next) {
    if (req.session.user) {
        res.set('Cache-Control', 'no-store');
        return next();
    } else {
        logger.info(`UNAUTHENTICATED_ACCESS | route=${req.originalUrl} | ip=${req.ip}`);
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
