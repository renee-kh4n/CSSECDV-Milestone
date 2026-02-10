const router = require('express').Router();

const { isLoggedin } = require('../middlewares/auth.middleware');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');

router.use(authRoutes);
router.use(userRoutes);
router.use(adminRoutes);

router.get('/', isLoggedin, (req, res) => {
    return res.redirect('/profile');
}); 

router.all('/{*any}', (req, res) => {
    res.redirect('/');
});

module.exports = router;