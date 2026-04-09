const express = require('express');

const faqController = require('../controllers/faqController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { faqSchema } = require('../validators/faqSchemas');
const { isLoggedin, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/faq', isLoggedin, faqController.getAllFAQs);

router.get('/faq/create', isLoggedin, isAdmin, faqController.showCreateFAQForm);
router.post('/faq/create', isLoggedin, isAdmin, validate(faqSchema, '/faq/create'), faqController.createFAQ,);

router.get('/faq/edit/:id', isLoggedin, isAdmin, validateID, faqController.showEditFAQForm,);
router.post('/faq/edit/:id', isLoggedin, isAdmin, validateID, validate(faqSchema, (req) => `/faq/edit/${req.params.id}`), faqController.updateFAQ);
router.post('/faq/delete/:id',isLoggedin, isAdmin, validateID, faqController.deleteFAQ);

module.exports = router;