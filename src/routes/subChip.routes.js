const express = require('express');
const multer = require('multer');

const postController = require('../controllers/postController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { isLoggedin, isNotBanned} = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

router.get('/chip/:subChipID', isLoggedin, isNotBanned, validateID, postController.getAllPosts);

router.get('/chip/:subChipID/create', isLoggedin, isNotBanned, validateID, postController.showCreatePost);
router.post('/chip/:subChipID/create', isLoggedin, isNotBanned, validateID, upload.single('image'), validate(postSchema, '/chip/:subChipID/create'), postController.createPost);

router.get('/chip/:subChipID/edit/:id', isLoggedin, isNotBanned, validateID, postController.showEditPostForm);
router.post('/chip/:subChipID/edit/:id', isLoggedin, isNotBanned, validateID, upload.single('image'), validate(postSchema, (req) => `/chip/${req.params.subChipID}/edit/${req.params.id}`), postController.updatePost);
router.post('/chip/:subChipID/delete/:id', isLoggedin, isNotBanned, validateID, postController.deletePost);

module.exports = router;