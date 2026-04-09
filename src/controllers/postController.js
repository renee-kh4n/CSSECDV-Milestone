const { date } = require('zod');
const postModel = require('../models/postModel');
const ratingModel = require('../models/ratingModel');
const commentModel = require('../models/commentModel');
const subChipModel = require('../models/subChipModel');
const supabase = require('../supabase');
const logger = require('../logger');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const userId = req.session?.user?.id;
        const subchip_id = req.params.subChipID;

        const subChip = await subChipModel.getSubChipByID(subchip_id);

        let ratingsByPostId = {};
        let averageRatingsByPostId = {};

        if (posts.length > 0) {
            const postIds = posts.map((post) => post.id);
            const averageRatings = await ratingModel.getAverageRatingsForPosts(postIds);
            averageRatingsByPostId = averageRatings.reduce((acc, row) => {
                acc[row.post_id] = {
                    averageRating: Number(row.average_rating),
                    ratingCount: Number(row.rating_count)
                };

                return acc;
            }, {});
        }

        if (userId && posts.length > 0) {
            const postIds = posts.map((post) => post.id);
            const ratings = await ratingModel.getRatingsForUserAndPosts(userId, postIds);
            ratingsByPostId = ratings.reduce((acc, row) => {
                acc[row.post_id] = row.rating;

                return acc;
            }, {});
        }

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
                    userRating: ratingsByPostId[post.id] || null,
                    averageRating: averageRatingsByPostId[post.id]?.averageRating || null,
                    ratingCount: averageRatingsByPostId[post.id]?.ratingCount || 0,
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

        logger.info(
            `POSTS_FETCH | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render(`subChip`, { title: subChip.title, subchip_id, posts: updatedPosts });
    } catch (err) {
        logger.info(
            `POSTS_FETCH_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.getAllPostsFromSubChip = async (req, res) => {
    try {
        const subchip_id = req.params.subChipID;
        const posts = await postModel.getAllPostsFromSubChip(subchip_id);
        const userId = req.session?.user?.id;

        const subChip = await subChipModel.getSubChipByID(subchip_id);

        let ratingsByPostId = {};
        let averageRatingsByPostId = {};

        if (posts.length > 0) {
            const postIds = posts.map((post) => post.id);
            const averageRatings = await ratingModel.getAverageRatingsForPosts(postIds);
            averageRatingsByPostId = averageRatings.reduce((acc, row) => {
                acc[row.post_id] = {
                    averageRating: Number(row.average_rating),
                    ratingCount: Number(row.rating_count)
                };
                return acc;
            }, {});
        }

        if (userId && posts.length > 0) {
            const postIds = posts.map((post) => post.id);
            const ratings = await ratingModel.getRatingsForUserAndPosts(userId, postIds);
            ratingsByPostId = ratings.reduce((acc, row) => {
                acc[row.post_id] = row.rating;
                return acc;
            }, {});
        }

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
                    userRating: ratingsByPostId[post.id] || null,
                    averageRating: averageRatingsByPostId[post.id]?.averageRating || null,
                    ratingCount: averageRatingsByPostId[post.id]?.ratingCount || 0,
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

        logger.info(
            `POSTS_SUBCHIP_FETCH | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render(`subChip`, { title: subChip.title, subchip_id, posts: updatedPosts });
    } catch (err) {
        logger.info(
            `POSTS_SUBCHIP_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.showCreatePost = async (req, res) => {
    const subchip_id = req.params.subChipID;
    try {
        logger.info(
            `POSTS_CREATE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editPost', { title: 'Create Post', subchip_id });
    } catch (err) {
        logger.error(
            `POSTS_CREATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
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

        logger.info(
            `POSTS_UPDATE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editPost', { title: 'Edit Post', subchip_id, post });
    } catch (err) {
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        logger.info(
            `POSTS_UPDATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | error=${err.stack || err}`,
        );
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
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
                logger.warn(
                    `POST_CREATE_FAIL | user=${req.session.user?.id} | reason=invalid_file_type | ip=${req.ip} | error = ${error}`,
                );
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect(`/chip/${subchip_id}/create`);
            }

            const fileName = `${Date.now()}-${Math.random()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                logger.warn(
                    `POST_CREATE_FAIL | user=${req.session.user?.id} | reason=database_file_upload | ip=${req.ip} | error = ${error}`,
                );
                console.error((process.env.DEBUG === 'true' ? error?.stack : error?.message) ?? err ?? 'Unknown error');
                req.session.errorMessage = 'Image upload failed';
                return res.redirect(`/chip/${subchip_id}/create`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }
        await postModel.createPost(userId, subchip_id, description, price, imageUrl);
        logger.info(
            `POSTS_CREATE | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.error(
            `POSTS_CREATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
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
                logger.warn(
                    `POST_UPDATE_FAIL | user=${req.session.user?.id} | reason=invalid_file_type | ip=${req.ip}`,
                );
                req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
                return res.redirect(`/chip/${subchip_id}/edit/${postId}`);
            }

            const fileName = `${Date.now()}-${crypto.randomUUID()}.${type.ext}`;

            const { error } = await supabase.storage
                .from('posts')
                .upload(fileName, req.file.buffer, { contentType: type.mime });

            if (error) {
                logger.warn(
                    `POST_UPDATE_FAIL | user=${req.session.user?.id} | reason=database_file_upload | ip=${req.ip}`,
                );
                console.error((process.env.DEBUG === 'true' ? error?.stack : error?.message) ?? err ?? 'Unknown error');
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
        logger.info(
            `POSTS_UPDATE | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.error(
            `POSTS_UPDATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        const deleted = await postModel.deletePost(postId, userId);
        if (!deleted) return res.status(403).send('Forbidden');

        logger.info(
            `POSTS_DELETE | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.error(
            `POSTS_DELETE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.showCreateComment = async (req, res) => {
    const subchip_id = req.params.subChipID;
    try {
        logger.info(
            `COMMENT_CREATE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editComment', { title: 'Add Comment', subchip_id, comment: {}, postId: req.params.postId });
    } catch (err) {
        logger.info(
            `COMMENT_CREATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error',
            noNavbar: true
        });
    }
};

exports.showEditCommentForm = async (req, res) => {
    const subchip_id = req.params.subChipID;
    const commentId = req.params.id;
    const userId = req.session.user.id;
    try {
        const comment = await commentModel.getCommentByID(commentId);
        if (!comment) return res.status(404).send('Comment not found');
        if (comment.user_id !== userId) return res.status(403).send('Forbidden');

        logger.info(
            `COMMENT_UPDATE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.render('editComment', { title: 'Edit Comment', subchip_id, comment, postId: req.params.postId });
    } catch (err) {
        logger.info(
            `COMMENT_UPDATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | commentId=${commentId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.createComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        await commentModel.createComment(userId, postId, content);

        logger.info(
            `COMMENT_CREATE | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.info(
            `COMMENT_CREATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error',
            noNavbar: true
        });
    }
};

exports.updateComment = async (req, res) => {
    const { content } = req.body;
    const commentId = req.params.id;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        const updated = await commentModel.updateComment(commentId, userId, content);
        if (!updated) return res.status(403).send('Forbidden');

        logger.info(
            `COMMENT_UDPATE | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.info(
            `COMMENT_UPDATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | commentId=${commentId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const subchip_id = req.params.subChipID;
    const userId = req.session.user.id;

    try {
        const deleted = await commentModel.deleteComment(commentId, userId);
        if (!deleted) return res.status(403).send('Forbidden');

        logger.info(
            `COMMENT_DELETE | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.info(
            `COMMENT_DELETE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | commentId=${commentId} | error=${err.stack || err}`,
        );
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.submitRating = async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.session?.user?.id;
    const rating = Number(req.body.rating);
    const ratingAction = req.body.ratingAction;
    const subchip_id = req.params.subChipID;

    try {
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        if (ratingAction === 'clear') {
            if (!Number.isInteger(postId)) {
                logger.warn(
                    `RATING_CRUD_FAIL | user=${req.session.user?.id} | reason=invalid_post | ip=${req.ip}`,
                );
                req.session.errorMessage = 'Invalid post';
                return res.redirect(`/chip/${subchip_id}`);
            }

            await ratingModel.deleteRating(postId, userId);

            logger.info(
                `RATING_CRUD | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | action=${ratingAction}`,
            );
            
            return res.redirect(`/chip/${subchip_id}`);
        }

        if (!Number.isInteger(postId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            logger.warn(
                `RATING_CRUD_FAIL | user=${req.session.user?.id} | reason=ivalid_rating_value | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid rating value';
            return res.redirect(`/chip/${subchip_id}`);
        }

        await ratingModel.upsertRating(postId, userId, rating);

        logger.info(
            `RATING_CRUD | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | action=${ratingAction}`,
        );

        return res.redirect(`/chip/${subchip_id}`);
    } catch (err) {
        logger.info(
            `RATING_CRUD_ERROR | user=${req.session.user?.id} | ip=${req.ip} | postId=${postId} | action=${ratingAction} | error=${err.stack || err} `,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};