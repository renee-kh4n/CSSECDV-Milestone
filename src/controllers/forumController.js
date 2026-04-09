const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const supabase = require('../supabase');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const userId = req.session?.user?.id;

        const updatedPosts = await Promise.all(
            posts.map(async (post) => {
                const comments = await commentModel.getCommentsByPostId(post.id);

                const updatedComments = comments.map(comment => ({
                    ...comment,
                    isOwner: userId && comment.user_id === userId,
                    datetime: new Date(comment.created_at).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })
                }));

                return {
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
                    }),
                    comments: updatedComments
                };
            })
        );

        return res.render('forum', { title: 'Forum', posts: updatedPosts });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreatePost = async (req, res) => {
    try {
        return res.render('editPost', { title: 'Create Post', post: {} });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditPostForm = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.user.id;

    try {
        const post = await postModel.getPostByID(postId);
        if (!post) return res.status(404).send('Post not found');
        if (post.user_id !== userId) return res.status(403).send('Forbidden');

        return res.render('editPost', { title: 'Edit Post', post });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createPost = async (req, res) => {
    const { description, price } = req.body;
    const userId = req.session.user.id;

    try {
        let imageUrl = null;

        if (req.file) {
            const { fileTypeFromBuffer } = await import('file-type');
            const type = await fileTypeFromBuffer(req.file.buffer);

            if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect('/forum/create');
            }

            const fileName = `${Date.now()}-${Math.random()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                console.error('Supabase upload error:', error);
                req.session.errorMessage = 'Image upload failed';
                return res.redirect('/forum/create');
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        await postModel.createPost(userId, description, price, imageUrl);
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updatePost = async (req, res) => {
    const { description, price } = req.body;
    const postId = req.params.id;
    const userId = req.session.user.id;

    try {
        let imageUrl = null;

        if (req.file) {
            const { fileTypeFromBuffer } = await import('file-type');
            const type = await fileTypeFromBuffer(req.file.buffer);

            if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect(`/forum/edit/${postId}`);
            }

            const fileName = `${Date.now()}-${crypto.randomUUID()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                console.error('Supabase upload error:', error);
                req.session.errorMessage = 'Image upload failed';
                return res.redirect(`/forum/edit/${postId}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const updated = await postModel.updatePost(postId, userId, description, price, imageUrl);
        if (!updated) return res.status(403).send('Forbidden');
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.user.id;

    try {
        const deleted = await postModel.deletePost(postId, userId);
        if (!deleted) return res.status(403).send('Forbidden');

        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreateComment = async (req, res) => {
    try {
        return res.render('editComment', { title: 'Add Comment', comment: {}, postId: req.params.postId });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditCommentForm = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.session.user.id;
    try {
        const comment = await commentModel.getCommentByID(commentId);
        if (!comment) return res.status(404).send('Comment not found');
        if (comment.user_id !== userId) return res.status(403).send('Forbidden');

        return res.render('editComment', { title: 'Edit Comment', comment, postId: req.params.postId });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.session.user.id;

    try {
        await commentModel.createComment(userId, postId, content);
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updateComment = async (req, res) => {
    const { content } = req.body;
    const commentId = req.params.id;
    const userId = req.session.user.id;

    try {
        const updated = await commentModel.updateComment(commentId, userId, content);
        if (!updated) return res.status(403).send('Forbidden');
        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.session.user.id;

    try {
        const deleted = await commentModel.deleteComment(commentId, userId);
        if (!deleted) return res.status(403).send('Forbidden');

        return res.redirect('/forum');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};