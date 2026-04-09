const { date } = require('zod');
const postModel = require('../models/postModel');
const subChipModel = require('../models/subChipModel');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const userId = req.session?.user?.id;
        const subChip = req.params.subChip;

        const updatedPosts = posts.map(post => ({
            ...post,
            isOwner: userId && post.user_id === userId,
            datetime: new Date(post.created_at).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }));
        return res.render(`subChip`, { title: subChip, posts: updatedPosts });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreatePost = async (req, res) => {
    const subChipTitle = req.params.subChip;
    try {         
        return res.render('editPost', { title: 'Create Post', subChipTitle, post: {} });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditPostForm = async (req, res) => {
    const postId = req.params.id;
    const subChipTitle = req.params.subChip;
    try {
        const post = await postModel.getPostByID(postId);
        if (!post) {
            return res.send('Post not found');
        }
        return res.render('editPost', { title: 'Edit Post', subChipTitle, post });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createPost = async (req, res) => {
    const { content } = req.body;
    const userId = req.session.user.id;
    try {
        await postModel.createPost(userId, content);
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updatePost = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;

    try {
        await postModel.updatePost(postId, content);
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        await postModel.deletePost(postId);
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};