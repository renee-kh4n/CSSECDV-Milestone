const express = require('express');
const multer = require('multer');

const postController = require('../controllers/postController');
const validate = require('../middlewares/validate.middleware');
const validateID = require('../middlewares/validateID.middleware');
const { postSchema } = require('../validators/postSchemas');
const { ratingSchema } = require('../validators/ratingSchemas');
const { commentSchema } = require('../validators/commentSchemas');
const { isLoggedin, isAdmin, isNotBanned} = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer();

router.get('/chip/:subChipID', isLoggedin, isAdmin, isNotBanned, validateID, postController.getAllPostsFromSubChip);

// Create Post
router.get('/chip/:subChipID/create', isLoggedin, isAdmin, isNotBanned, validateID, postController.showCreatePost);
router.post('/chip/:subChipID/create', isLoggedin, isAdmin, isNotBanned, validateID, upload.single('image'), validate(postSchema, (req) => `/chip/${req.params.subChipID}/create`), postController.createPost);

// Edit & Delete Post
router.get('/chip/:subChipID/edit/:id', isLoggedin, isAdmin, isNotBanned, validateID, postController.showEditPostForm);
router.post('/chip/:subChipID/edit/:id', isLoggedin, isAdmin, isNotBanned, validateID, upload.single('image'), validate(postSchema, (req) => `/chip/${req.params.subChipID}/edit/${req.params.id}`), postController.updatePost);
router.post('/chip/:subChipID/delete/:id', isLoggedin, isAdmin, isNotBanned, validateID, postController.deletePost);

// Create Comment
router.get('/chip/:subChipID/:postId/create', isLoggedin, isAdmin, isNotBanned, validateID, postController.showCreateComment);
router.post('/chip/:subChipID/:postId/create', isLoggedin, isAdmin, isNotBanned, validateID, validate(commentSchema, (req) => `/chip/${req.params.subChipID}/${req.params.postId}/create`), postController.createComment);

// Edit & Delete Comment
router.get('/chip/:subChipID/:postId/edit/:id', isLoggedin, isAdmin, isNotBanned, validateID, postController.showEditCommentForm);
router.post('/chip/:subChipID/:postId/edit/:id', isLoggedin, isAdmin, isNotBanned, validateID, validate(commentSchema, (req) => `/chip/${req.params.subChipID}/${req.params.postId}/edit/${req.params.id}`), postController.updateComment);
router.post('/chip/:subChipID/:postId/delete/:id', isLoggedin, isAdmin, isNotBanned, validateID, postController.deleteComment);

// Ratings
router.post('/chip/:subChipID/rating/:id', isLoggedin, isNotBanned, validateID, validate(ratingSchema, (req) => `/chip/${req.params.subChipID}/rating/${req.params.id}`), postController.submitRating);

module.exports = router;