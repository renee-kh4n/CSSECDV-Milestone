const pool = require('../db');

const createAnnouncement = async (title, content, user_id) => {
	const result = await pool.query(
		`INSERT INTO announcements (title, content, user_id)
		 VALUES ($1, $2, $3)
		 RETURNING *`,
		[title, content, user_id]
	);
	return result.rows[0];
};

const getAllAnnouncements = async () => {
	const result = await pool.query(`
		SELECT *
		FROM announcements
		ORDER BY created_at DESC
	`);
	return result.rows;
};

const getAnnouncementByID = async (id) => {
	const result = await pool.query(
		'SELECT * FROM announcements WHERE announcement_id = $1',
		[id]
	);
	return result.rows[0];
};

const announcementExists = async (title) => {
	const result = await pool.query(
		'SELECT 1 FROM announcements WHERE title = $1 LIMIT 1',
		[title]
	);
	return result.rowCount > 0;
};

const updateAnnouncement = async (id, title, content, user_id) => {
	const result = await pool.query(
		`UPDATE announcements
		 SET title = $1,
		     content = $2,
		     user_id = $3
		 WHERE announcement_id = $4
		 RETURNING *`,
		[title, content, user_id, id]
	);
	return result.rows[0];
};

const deleteAnnouncement = async (id) => {
	const result = await pool.query(
		'DELETE FROM announcements WHERE announcement_id = $1 RETURNING *',
		[id]
	);
	return result.rows[0];
};

module.exports = {
	createAnnouncement,
	getAllAnnouncements,
	getAnnouncementByID,
	announcementExists,
	updateAnnouncement,
	deleteAnnouncement,
};