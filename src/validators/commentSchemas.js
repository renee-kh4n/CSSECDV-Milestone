const { z } = require('zod');

const commentSchema = z.object({
    content: z.string().trim().min(1, 'Content is required').max(5000, 'Content is too long')
});

module.exports = { commentSchema };