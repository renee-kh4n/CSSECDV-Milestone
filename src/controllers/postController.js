const { date } = require('zod');
const postModel = require('../models/postModel');
const subChipModel = require('../models/subChipModel');
const supabase = require('../supabase');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const userId = req.session?.user?.id;
        const subchip_id = req.params.subChipID;

        const subChip = await subChipModel.getSubChipByID(subchip_id);

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
        return res.render(`subChip`, { title: subChip.title, subchip_id, posts: updatedPosts });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.getAllPostsFromSubChip = async (req, res) => {
    try {
        const subchip_id = req.params.subChipID;
        const posts = await postModel.getAllPostsFromSubChip(subchip_id);
        const userId = req.session?.user?.id;

        const subChip = await subChipModel.getSubChipByID(subchip_id);

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
        return res.render(`subChip`, { title: subChip.title, subchip_id, posts: updatedPosts });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreatePost = async (req, res) => {
    const subchip_id = req.params.subChipID;
    try {
        return res.render('editPost', { title: 'Create Post', subchip_id, post: {} });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditPostForm = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.user.id;
    const subchip_id = req.params.subChipID;

    try {
        const post = await postModel.getPostByID(postId);
        if (!post) return res.status(404).send('Post not found');
        if (post.user_id !== userId) return res.status(403).send('Forbidden');

        return res.render('editPost', { title: 'Edit Post', subchip_id, post });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createPost = async (req, res) => {
    const { description, price } = req.body;
    const userId = req.session.user.id;
    const subchip_id = req.params.subChipID;

    try {
        let imageUrl = null;

        if (req.file) {
            const { fileTypeFromBuffer } = await import('file-type');
            const type = await fileTypeFromBuffer(req.file.buffer);

            if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect(`/chip/${subchip_id}/create`);
            }

            const fileName = `${Date.now()}-${Math.random()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                console.error('Supabase upload error:', error);
                req.session.errorMessage = 'Image upload failed';
                return res.redirect(`/chip/${subchip_id}/create`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }
        await postModel.createPost(userId, subchip_id, description, price, imageUrl);
        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updatePost = async (req, res) => {
    const { description, price } = req.body;
    const postId = req.params.id;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        let imageUrl = null;

        if (req.file) {
            const { fileTypeFromBuffer } = await import('file-type');
            const type = await fileTypeFromBuffer(req.file.buffer);

            if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect(`/chip/${subchip_id}/edit/${postId}`);
            }

            const fileName = `${Date.now()}-${crypto.randomUUID()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                console.error('Supabase upload error:', error);
                req.session.errorMessage = 'Image upload failed';
                return res.redirect(`/chip/${subchip_id}/edit/${postId}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const updated = await postModel.updatePost(postId, userId, description, price, imageUrl);
        if (!updated) return res.status(403).send('Forbidden');
        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        const deleted = await postModel.deletePost(postId, userId);
        if (!deleted) return res.status(403).send('Forbidden');

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};