const pool = require('../db');

const upsertRating = async (postId, userId, rating) => {
    const result = await pool.query(
        `
        INSERT INTO ratings (post_id, user_id, rating)
        VALUES ($1, $2, $3)
        ON CONFLICT (post_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating
        RETURNING *
        `,
        [postId, userId, rating]
    );
    return result.rows[0];
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

module.exports = {
    upsertRating,
    getRatingsForUserAndPosts,
};