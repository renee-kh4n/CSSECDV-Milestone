const userModel = require('../models/userModel');

exports.showUserProfile = async (req, res) => {
    try {
        const result = await userModel.getUserById(req.session.user.id);

        const phoneNumber = result.phone_number.replace(/^0+/, '');
        
        const user = {
            firstName: result.first_name,
            lastName: result.last_name,
            email: result.email,
            phoneNumber: phoneNumber,
            pfp: result.pfp || '',
            role: result.role
        };
        return res.render('profile', { title: 'User Profile', user});
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};