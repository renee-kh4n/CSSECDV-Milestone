const { date } = require('zod');
const postModel = require('../models/postModel');
const supabase = require('../supabase');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const userId = req.session?.user?.id;

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

    try {
        const post = await postModel.getPostByID(postId);
        if (!post) {
            return res.send('Post not found');
        }
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

        await postModel.updatePost(postId, description, price, imageUrl);
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