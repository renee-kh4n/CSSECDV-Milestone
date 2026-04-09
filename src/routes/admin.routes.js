const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { isLoggedin, isAdmin } = require('../middlewares/auth.middleware');

router.get('/admin', isLoggedin, isAdmin, adminController.showAdminDashboard);
router.get('/admin/ban-users', isLoggedin, isAdmin, adminController.showBanUsersPage);
router.post('/admin/ban-users/:id/ban', isLoggedin, isAdmin, adminController.banUser);
router.post('/admin/ban-users/:id/unban', isLoggedin, isAdmin, adminController.unbanUser);

module.exports = router;
