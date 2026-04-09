const pool = require('../db');

const createComment = async (userId, postId, content) => {
	const result = await pool.query(
		'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
		[userId, postId, content]
	);
	return result.rows[0];
};

const getCommentsByPostId = async (postId) => {
	const result = await pool.query(`
		SELECT 
			comments.*,
			users.first_name,
			users.last_name,
			users.pfp
		FROM comments
		JOIN users ON comments.user_id = users.user_id
		WHERE comments.post_id = $1
		ORDER BY comments.created_at DESC
	`, [postId]);

	return result.rows;
};

const getCommentByID = async (id) => {
	const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
	return result.rows[0];
};

const updateComment = async (id, userId, content) => {
    const result = await pool.query(
        `
        UPDATE comments
        SET content = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
        `,
        [content, id, userId]
    );

    return result.rows[0];
};

const deleteComment = async (id, userId) => {
	const result = await pool.query(
		'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
		[id, userId],
	);
	return result.rows[0];
};

module.exports = {
	createComment,
	getCommentsByPostId,
	getCommentByID,
	updateComment,
	deleteComment,
};
