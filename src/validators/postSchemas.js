const { z } = require('zod');

const postSchema = z.object({
    description: z.string().trim().min(1, 'Description is required').max(5000, 'Description is too long'),
    price: z.coerce.number().nonnegative('Price must be non-negative').refine(val => Number.isFinite(val), 'Invalid number').refine(val => /^\d{1,10}(\.\d{1,2})?$/.test(val.toString()),'Max 10 digits before decimal and 2 decimal places')
});

module.exports = { postSchema };