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