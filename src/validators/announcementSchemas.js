const { z } = require('zod');

const announcementSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, 'Title is too short')
		.max(255, 'Title is too long'),

	content: z
		.string()
		.trim()
		.min(1, 'Content is required')
		.max(5000, 'Content is too long'),
});

module.exports = { announcementSchema };