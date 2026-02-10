const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const { isGuest } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,               
    handler: (req, res) => {
        return res.status(429).render('login', { 
            errorMessage: 'Too many login attempts. Please wait 15 minutes before trying again.',
            disabled: true
        });
    }
});

router.get('/register', isGuest, authController.showRegisterPage);
router.post("/register", upload.single("pfp"),  authController.registerUser);

router.get('/login', isGuest, authController.showLoginPage);
router.post('/login', loginLimiter, authController.loginUser);

router.get('/logout', authController.logoutUser);

module.exports = router;
