const express = require('express');
const multer = require('multer');

const forumController = require('../controllers/forumController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { commentSchema } = require('../validators/commentSchemas');
const { isLoggedin } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

router.get('/forum', isLoggedin, forumController.getAllPosts);

// Create Post
router.get('/forum/create', isLoggedin, forumController.showCreatePost);
router.post('/forum/create', isLoggedin, upload.single('image'), validate(postSchema, '/forum/create'), forumController.createPost);

// Edit & Delete Post
router.get('/forum/edit/:id', isLoggedin, validateID, forumController.showEditPostForm);
router.post('/forum/edit/:id', isLoggedin, validateID, upload.single('image'), validate(postSchema, (req) => `/forum/edit/${req.params.id}`), forumController.updatePost);
router.post('/forum/delete/:id', isLoggedin, validateID, forumController.deletePost);

// Create Comment
router.get('/forum/:postId/create', isLoggedin, validateID, forumController.showCreateComment);
router.post('/forum/:postId/create', isLoggedin, validateID, validate(commentSchema, (req) => `/forum/${req.params.postId}/create`), forumController.createComment);

// Edit & Delete Comment
router.get('/forum/:postId/edit/:id', isLoggedin, validateID, forumController.showEditCommentForm);
router.post('/forum/:postId/edit/:id', isLoggedin, validateID, validate(commentSchema, (req) => `/forum/${req.params.postId}/edit/${req.params.id}`), forumController.updateComment);
router.post('/forum/:postId/delete/:id', isLoggedin, validateID, forumController.deleteComment);

module.exports = router;