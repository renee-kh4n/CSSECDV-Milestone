// const express = require('express');

// const postController = require('../controllers/postController');
// const validate = require('../middlewares/validate.middleware');
// const validateID = require('../middlewares/validateID.middleware');
// const { postSchema } = require('../validators/postSchemas');
// const { isLoggedin } = require('../middlewares/auth.middleware');

// const router = express.Router();

// router.get('/forum', isLoggedin, postController.getAllPosts);

// router.get('/forum/create', isLoggedin, postController.showCreatePost);
// router.post('/forum/create', isLoggedin, validate(postSchema, '/forum/create'), postController.createPost);

// router.get('/forum/edit/:id', isLoggedin, validateID, postController.showEditPostForm);
// router.post('/forum/edit/:id', isLoggedin, validateID, validate(postSchema, (req) => `/forum/edit/${req.params.id}`), postController.updatePost);
// router.post('/forum/delete/:id', isLoggedin, validateID, postController.deletePost);

// module.exports = router;