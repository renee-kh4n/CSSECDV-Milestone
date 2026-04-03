const { z } = require('zod');

const faqSchema = z.object({
	question: z.string().trim().min(5, 'Question is too short').max(255, 'Question is too long'),
	answer: z.string().trim().min(1, 'Answer is required').max(5000, 'Answer is too long'),
});

module.exports = { faqSchema };