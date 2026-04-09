const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/authSchemas');
const { isGuest } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 4,               
    handler: (req, res) => {
        req.session.rateLimited = true;
        setTimeout(() => {
            req.session.rateLimited = false;
            req.session.save();
        }, 15 * 60 * 1000);
        logger.warn(
            `LIMIT | ip=${req.ip}`,
        );
        return res.redirect('/limit');
    }
});

router.get('/register', isGuest, authController.showRegisterPage);
router.post('/register', upload.single('pfp'), validate(registerSchema, '/register'), authController.registerUser);

router.get('/login', isGuest, authController.showLoginPage);
router.post('/login', loginLimiter, validate(loginSchema, '/login'), authController.loginUser);

router.post('/logout', authController.logoutUser);

module.exports = router;
