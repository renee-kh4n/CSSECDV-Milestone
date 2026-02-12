const { z } = require('zod');

const registerSchema = z.object({
    firstName: z.string().trim().min(2, 'First name is too short').max(50),
    lastName: z.string().trim().min(2, 'Last name is too short').max(50),
    email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
    phoneNumber: z.string().trim().min(1).regex(/^9\d{9}$/, 'Enter a valid Philippine phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
});

const loginSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/)
});

module.exports = { registerSchema, loginSchema };
