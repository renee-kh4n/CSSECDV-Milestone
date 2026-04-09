const userModel = require('../models/userModel');

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
        return res.render('admin', { title: 'Admin Dashboard', users });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
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

        return res.render('adminBanUsers', {
            title: 'Ban Users',
            searchQuery,
            users,
            bannedUsers
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.banUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (!Number.isInteger(userId)) {
            req.session.errorMessage = 'Invalid user ID.';
            return res.redirect('/admin/ban-users');
        }

        const updatedUser = await userModel.setUserBanStatus(userId, true);
        if (!updatedUser) {
            req.session.errorMessage = 'Unable to ban this user.';
        }

        return res.redirect('/admin/ban-users');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.unbanUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (!Number.isInteger(userId)) {
            req.session.errorMessage = 'Invalid user ID.';
            return res.redirect('/admin/ban-users');
        }

        const updatedUser = await userModel.setUserBanStatus(userId, false);
        if (!updatedUser) {
            req.session.errorMessage = 'Unable to unban this user.';
        }

        return res.redirect('/admin/ban-users');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};
