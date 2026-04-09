const express = require('express');

const subChipController = require('../controllers/subChipController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { subChipSchema } = require('../validators/subChipSchemas');
const { isLoggedin, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/chip', isLoggedin, subChipController.getAllSubChips);

router.get('/chip/create', isLoggedin, isAdmin, subChipController.showCreateSubChipForm);
router.post('/chip/create', isLoggedin, isAdmin, validate(subChipSchema, '/chip/create'), subChipController.createSubChip);

router.get('/chip/edit/:subChipid', isLoggedin, isAdmin, validateID, subChipController.showEditSubChipForm);
router.post('/chip/edit/:subChipid', isLoggedin, isAdmin, validateID, validate(subChipSchema, (req) => `/chip/edit/${req.params.id}`), subChipController.updateSubChip);
router.post('/chip/delete/:subChipid', isLoggedin, isAdmin, validateID, subChipController.deleteSubChip);

module.exports = router;