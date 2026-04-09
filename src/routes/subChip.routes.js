const express = require('express');

const postController = require('../controllers/postController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { isLoggedin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/chip/:subChip', isLoggedin, postController.getAllPosts);

router.get('/chip/:subChip/create', isLoggedin, postController.showCreatePost);
router.post('/chip/:subChip/create', isLoggedin, validate(postSchema, '/chip/:subChip/create'), postController.createPost);

router.get('/chip/:subChip/edit/:id', isLoggedin, validateID, postController.showEditPostForm);
router.post('/chip/:subChip/edit/:id', isLoggedin, validateID, validate(postSchema, (req) => `/chip/${req.params.subChip}/edit/${req.params.id}`), postController.updatePost);
router.post('/chip/:subChip/delete/:id', isLoggedin, validateID, postController.deletePost);

module.exports = router;