const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { isLoggedin } = require('../middlewares/auth.middleware');

router.get('/profile', isLoggedin, userController.showUserProfile);

module.exports = router;
