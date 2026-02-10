const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { isLoggedin, isAdmin } = require('../middlewares/auth.middleware');

router.get('/admin', isLoggedin, isAdmin, adminController.showAdminDashboard);

module.exports = router;
