const { z } = require('zod');

const subChipSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, 'Title is too short')
		.max(255, 'Title is too long'),

	description: z
		.string()
		.trim()
		.min(1, 'Description is required')
		.max(5000, 'Description is too long'),
});

module.exports = { subChipSchema };