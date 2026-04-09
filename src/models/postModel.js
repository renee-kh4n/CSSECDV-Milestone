const pool = require('../db');

const createPost = async (userId, description, price, image) => {
	console.log('Creating post with:', { userId, description, price, image });
	const result = await pool.query(
		'INSERT INTO posts (user_id, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
		[userId, description, price, image]
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

const updatePost = async (id, userId, description, price, image) => {
    let query;
    let values;

    if (image) {
        query = `
            UPDATE posts
            SET description = $1, price = $2, image = $3
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `;
        values = [description, price, image, id, userId];
    } else {
        query = `
            UPDATE posts
            SET description = $1, price = $2
            WHERE id = $3 AND user_id = $4
            RETURNING *
        `;
        values = [description, price, id, userId];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deletePost = async (id, userId) => {
	const result = await pool.query(
		'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
		[id, userId],
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
