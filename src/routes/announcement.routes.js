const express = require('express');

const announcementController = require('../controllers/announcementController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { announcementSchema } = require('../validators/announcementSchemas');
const { isLoggedin, isAdmin} = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/announcement', isLoggedin, announcementController.getAllAnnouncements);

// Create Announcement
router.get('/announcement/create', isLoggedin, isAdmin, announcementController.showCreateAnnouncement);
router.post('/announcement/create', isLoggedin, isAdmin, validate(announcementSchema, '/announcement/create'), announcementController.createAnnouncement);

// Edit & Delete Announcement
router.get('/announcement/edit/:announcementId', isLoggedin, isAdmin, validateID, announcementController.showEditAnnouncement);
router.post('/announcement/edit/:announcementId', isLoggedin, isAdmin, validateID, validate(announcementSchema, (req) => `/announcement/edit/${req.params.announcementId}`), announcementController.updateAnnouncement);
router.post('/announcement/delete/:announcementId', isLoggedin, isAdmin, validateID, announcementController.deleteAnnouncement);

module.exports = router;