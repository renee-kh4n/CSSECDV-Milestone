const pool = require('../db');

const upsertRating = async (postId, userId, rating) => {
    const updated = await pool.query(
        `
        UPDATE ratings
        SET rating = $3
        WHERE post_id = $1
          AND user_id = $2
        RETURNING *
        `,
        [postId, userId, rating]
    );

    if (updated.rows[0]) {
        return updated.rows[0];
    }

    const inserted = await pool.query(
        `
        INSERT INTO ratings (post_id, user_id, rating)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [postId, userId, rating]
    );
    return inserted.rows[0];
};

const deleteRating = async (postId, userId) => {
    const result = await pool.query(
        `
        DELETE FROM ratings
        WHERE post_id = $1
          AND user_id = $2
        RETURNING *
        `,
        [postId, userId]
    );

    return result.rows[0] || null;
};

const getRatingsForUserAndPosts = async (userId, postIds) => {
    if (!postIds || postIds.length === 0) return [];

    const result = await pool.query(
        `
        SELECT post_id, rating
        FROM ratings
        WHERE user_id = $1
          AND post_id = ANY($2::int[])
        `,
        [userId, postIds]
    );

    return result.rows;
};

const getAverageRatingsForPosts = async (postIds) => {
    if (!postIds || postIds.length === 0) return [];

    const result = await pool.query(
        `
        SELECT
            post_id,
            ROUND(AVG(rating)::numeric, 1) AS average_rating,
            COUNT(*)::int AS rating_count
        FROM ratings
        WHERE post_id = ANY($1::int[])
        GROUP BY post_id
        `,
        [postIds]
    );

    return result.rows;
};

const getRatedPostsByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            ratings.post_id,
            ratings.rating,
            ratings.created_at AS rated_at,
            posts.description,
            posts.price,
            posts.subchip_id,
            subchips.title AS subchip_title
        FROM ratings
        JOIN posts ON ratings.post_id = posts.id
        JOIN subchips ON posts.subchip_id = subchips.subchip_id
        WHERE ratings.user_id = $1
        ORDER BY ratings.created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

module.exports = {
    upsertRating,
    deleteRating,
    getRatingsForUserAndPosts,
    getAverageRatingsForPosts,
    getRatedPostsByUserId,
};