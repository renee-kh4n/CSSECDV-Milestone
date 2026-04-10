const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const ratingModel = require('../models/ratingModel');
const logger = require('../logger');

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

        logger.info(
            `PROFILE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.render('profile', {
            title: 'User Profile',
            user,
            myPosts: formattedMyPosts,
            myRatings: formattedMyRatings
        });
    } catch (err) {
        logger.error(
            `PROFILE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};