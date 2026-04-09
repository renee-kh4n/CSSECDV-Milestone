const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const ratingModel = require('../models/ratingModel');

exports.showUserProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const result = await userModel.getUserById(userId);
        const myPosts = await postModel.getPostsByUserId(userId);
        const myRatings = await ratingModel.getRatedPostsByUserId(userId);

        const phoneNumber = result.phone_number.replace(/^0+/, '');
        
        const user = {
            firstName: result.first_name,
            lastName: result.last_name,
            email: result.email,
            phoneNumber: phoneNumber,
            pfp: result.pfp || '',
            role: result.role
        };

        const formattedMyPosts = myPosts.map((post) => ({
            ...post,
            datetime: new Date(post.created_at).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }));

        const formattedMyRatings = myRatings.map((rating) => ({
            ...rating,
            datetime: new Date(rating.rated_at).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }));

        return res.render('profile', {
            title: 'User Profile',
            user,
            myPosts: formattedMyPosts,
            myRatings: formattedMyRatings
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};