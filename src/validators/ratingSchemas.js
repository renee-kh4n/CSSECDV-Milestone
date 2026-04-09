const { z } = require('zod');

const ratingSchema = z.object({
	rating: z.number().min(1).max(5)
});

module.exports = { ratingSchema };