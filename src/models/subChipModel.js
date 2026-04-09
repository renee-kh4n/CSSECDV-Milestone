const pool = require('../db');

const createSubChip = async (title, description) => {
	const result = await pool.query(
		`INSERT INTO subChips (title, description)
		 VALUES ($1, $2)
		 RETURNING *`,
		[title, description]
	);
	return result.rows[0];
};

const getAllSubChips = async () => {
	const result = await pool.query(`
		SELECT *
		FROM subChips
		ORDER BY created_at DESC
	`);
	return result.rows;
};

const getSubChipByID = async (id) => {
	const result = await pool.query(
		'SELECT * FROM subChips WHERE subchip_id = $1',
		[id]
	);
	return result.rows[0];
};

const subChipExists = async (title) => {
	const result = await pool.query(
		'SELECT 1 FROM subChips WHERE title = $1 LIMIT 1',
		[title]
	);
	return result.rowCount > 0;
};

const updateSubChip = async (id, title, description) => {
	const result = await pool.query(
		`UPDATE subChips
		 SET title = $1,
		     description = $2
		 WHERE subchip_id = $3
		 RETURNING *`,
		[title, description, id]
	);
	return result.rows[0];
};

const deleteSubChip = async (id) => {
	const result = await pool.query(
		'DELETE FROM subChips WHERE subchip_id = $1 RETURNING *',
		[id]
	);
	return result.rows[0];
};

module.exports = {
	createSubChip,
	getAllSubChips,
	getSubChipByID,
	subChipExists,
	updateSubChip,
	deleteSubChip,
};