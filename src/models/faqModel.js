const pool = require('../db');

const createFAQ = async (question, answer) => {
	const result = await pool.query(
		'INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING *',
		[question, answer],
	);
	return result.rows[0];
};

const getAllFAQs = async () => {
	const result = await pool.query('SELECT * FROM faqs ORDER BY id ASC');
	return result.rows;
};

const getFAQByID = async (id) => {
	const result = await pool.query('SELECT * FROM faqs WHERE id = $1', [id]);
	return result.rows[0];
};

const updateFAQ = async (id, question, answer) => {
	const result = await pool.query(
		'UPDATE faqs SET question = $1, answer = $2 WHERE id = $3 RETURNING *',
		[question, answer, id],
	);
	return result.rows[0];
};

const deleteFAQ = async (id) => {
	const result = await pool.query(
		'DELETE FROM faqs WHERE id = $1 RETURNING *',
		[id],
	);
	return result.rows[0];
};

module.exports = {
	createFAQ,
	getAllFAQs,
	getFAQByID,
	updateFAQ,
	deleteFAQ,
};
