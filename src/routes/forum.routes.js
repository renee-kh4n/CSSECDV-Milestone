const express = require('express');
const multer = require('multer');

const forumController = require('../controllers/forumController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { commentSchema } = require('../validators/commentSchemas');
const { isLoggedin, isNotBanned } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

router.get('/forum', isLoggedin, forumController.getAllPosts);

// Create Post
router.get('/forum/create', isLoggedin, isNotBanned, forumController.showCreatePost);
router.post('/forum/create', isLoggedin, isNotBanned, upload.single('image'), validate(postSchema, '/forum/create'), forumController.createPost);

// Edit & Delete Post
router.get('/forum/edit/:id', isLoggedin, isNotBanned, validateID, forumController.showEditPostForm);
router.post('/forum/edit/:id', isLoggedin, isNotBanned, validateID, upload.single('image'), validate(postSchema, (req) => `/forum/edit/${req.params.id}`), forumController.updatePost);
router.post('/forum/delete/:id', isLoggedin, isNotBanned, validateID, forumController.deletePost);

// Create Comment
router.get('/forum/:postId/create', isLoggedin, isNotBanned, validateID, forumController.showCreateComment);
router.post('/forum/:postId/create', isLoggedin, isNotBanned, validateID, validate(commentSchema, (req) => `/forum/${req.params.postId}/create`), forumController.createComment);

// Edit & Delete Comment
router.get('/forum/:postId/edit/:id', isLoggedin, isNotBanned, validateID, forumController.showEditCommentForm);
router.post('/forum/:postId/edit/:id', isLoggedin, isNotBanned, validateID, validate(commentSchema, (req) => `/forum/${req.params.postId}/edit/${req.params.id}`), forumController.updateComment);
router.post('/forum/:postId/delete/:id', isLoggedin, isNotBanned, validateID, forumController.deleteComment);

// Ratings
router.post('/forum/rating/:id', isLoggedin, isNotBanned, validateID, forumController.submitRating);

module.exports = router;