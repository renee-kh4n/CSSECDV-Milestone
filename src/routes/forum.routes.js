const express = require('express');
const multer = require('multer');

const postController = require('../controllers/postController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { isLoggedin, isNotBanned } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

router.get('/forum', isLoggedin, isNotBanned, postController.getAllPosts);

router.get('/forum/create', isLoggedin, isNotBanned, postController.showCreatePost);
router.post('/forum/create', isLoggedin, isNotBanned, upload.single('image'), validate(postSchema, '/forum/create'), postController.createPost);

router.get('/forum/edit/:id', isLoggedin, isNotBanned, validateID, postController.showEditPostForm);
router.post('/forum/edit/:id', isLoggedin, isNotBanned, validateID, upload.single('image'), validate(postSchema, (req) => `/forum/edit/${req.params.id}`), postController.updatePost);
router.post('/forum/delete/:id', isLoggedin, isNotBanned, validateID, postController.deletePost);
router.post('/forum/rating/:id', isLoggedin, isNotBanned, validateID, postController.submitRating);

module.exports = router;