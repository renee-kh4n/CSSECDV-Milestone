const pool = require('../db');

const createPost = async (userId, content) => {
	const result = await pool.query(
		'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
		[userId, content]
	);
	return result.rows[0];
};

const getAllPosts = async () => {
	const result = await pool.query(`
		SELECT 
			posts.*,
			users.first_name,
			users.last_name,
			users.pfp
		FROM posts
		JOIN users ON posts.user_id = users.user_id
		ORDER BY posts.created_at DESC
	`);
	return result.rows;
};

const getPostByID = async (id) => {
	const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
	return result.rows[0];
};

const updatePost = async (id, content) => {
	const result = await pool.query(
		'UPDATE posts SET content = $1 WHERE id = $2 RETURNING *',
		[content, id]
	);
	return result.rows[0];
};

const deletePost = async (id) => {
	const result = await pool.query(
		'DELETE FROM posts WHERE id = $1 RETURNING *',
		[id],
	);
	return result.rows[0];
};

module.exports = {
	createPost,
	getAllPosts,
	getPostByID,
	updatePost,
	deletePost,
};
