const router = require('express').Router();

const { isLoggedin } = require('../middlewares/auth.middleware');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const announcementRoutes = require('./announcement.routes');
const faqRoutes = require('./faq.routes');
const chipRoutes = require('./chip.routes');
const subChipRoutes = require('./subChip.routes');

router.use(authRoutes);
router.use(userRoutes);
router.use(adminRoutes);
router.use(announcementRoutes);
router.use(faqRoutes);
router.use(chipRoutes);
router.use(subChipRoutes);

router.get('/', isLoggedin, (req, res) => {
    return res.redirect('/profile');
}); 

router.all('/{*any}', (req, res) => {
    res.redirect('/');
});

module.exports = router;