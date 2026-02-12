const userModel = require('../models/userModel');

exports.showAdminDashboard = async (req, res) => {
    try {
        const result = await userModel.getAllUsers();
        const users = result.map(u => ({
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phoneNumber: u.phone_number,
            pfp: u.pfp || '',
            role: u.role
        }));
        return res.render('admin', { title: 'Admin Dashboard', users });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
};
