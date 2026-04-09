const userModel = require('../models/userModel');
const logger = require('../logger');
const path = require('path');
const fs = require('fs');

exports.showAdminDashboard = async (req, res) => {
    try {
        const result = await userModel.getAllUsers();
        const users = result.map(u => ({
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phoneNumber: u.phone_number.replace(/^0+/, ''),
            pfp: u.pfp || '',
            role: u.role
        }));
        logger.info(
            `ADMIN_DASHBOARD_VIEW | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('admin', { title: 'Admin Dashboard', users });
    } catch (err) {
        logger.error(
            `ADMIN_DASHBOARD_VIEW_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.showBanUsersPage = async (req, res) => {
    try {
        const searchQuery = (req.query.search || '').trim();
        const usersResult = await userModel.searchUsers(searchQuery);
        const bannedUsersResult = await userModel.getBannedUsers();

        const users = usersResult.map((u) => ({
            id: u.user_id,
            fullName: `${u.first_name} ${u.last_name}`,
            email: u.email,
            role: u.role,
            isBanned: u.is_banned
        }));

        const bannedUsers = bannedUsersResult.map((u) => ({
            id: u.user_id,
            fullName: `${u.first_name} ${u.last_name}`,
            email: u.email
        }));
        logger.info(
            `BANNED_USERS_VIEW | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('adminBanUsers', {
            title: 'Ban Users',
            searchQuery,
            users,
            bannedUsers
        });
    } catch (err) {
        logger.info(
            `BANNED_USERS_VIEW_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.banUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (!Number.isInteger(userId)) {
            logger.warn(
                `BAN_USER_FAIL | admin=${req.session.user?.id} | reason=invalid_user | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid user ID.';
            return res.redirect('/admin/ban-users');
        }

        const updatedUser = await userModel.setUserBanStatus(userId, true);
        if (!updatedUser) {
            logger.warn(
                `BAN_USER_FAIL | admin=${req.session.user?.id} | reason=failed_ban | ip=${req.ip} | userId=${req.params.id}`,
            );
            req.session.errorMessage = 'Unable to ban this user.';
        }

        logger.info(
            `BAN_USER | admin=${req.session.user?.id} | ip=${req.ip} | userId=${req.params.id}`,
        );
        return res.redirect('/admin/ban-users');
    } catch (err) {
        logger.info(
            `BAN_USER_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | userId=${req.params.id} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.unbanUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (!Number.isInteger(userId)) {
            logger.warn(
                `BAN_USER_FAIL | admin=${req.session.user?.id} | reason=invalid_user | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid user ID.';
            return res.redirect('/admin/ban-users');
        }

        const updatedUser = await userModel.setUserBanStatus(userId, false);
        if (!updatedUser) {
            logger.warn(
                `BAN_USER_FAIL | admin=${req.session.user?.id} | reason=failed_ban | ip=${req.ip} | userId=${req.params.id}`,
            );
            req.session.errorMessage = 'Unable to unban this user.';
        }

        logger.info(
            `UNBAN_USER | admin=${req.session.user?.id} | ip=${req.ip} | userId=${req.params.id}`,
        );
        return res.redirect('/admin/ban-users');
    } catch (err) {
        logger.error(
            `UNBAN_USER_ERROR | admin=${req.session.user?.email} | ip=${req.ip} | error=${err.stack || err} | userId=${req.params.id}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.downloadLog = async (req, res) => {
    const logPath = path.join(__dirname, '../../logs/app.log');

    if (!fs.existsSync(logPath)) {
        return res.render('error', {
            title: 'Log file not found', message: 'Log file not found.',
            noNavbar: true
        });
    }

    return res.download(logPath, 'app.log');
}