const { z } = require('zod');

const postSchema = z.object({
    description: z.string().trim().min(1, 'Description is required').max(5000, 'Description is too long'),
    price: z.coerce.number().nonnegative('Price must be positive').refine(val => Number.isFinite(val), 'Invalid number').refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Max 2 decimal places')
});

module.exports = { postSchema };