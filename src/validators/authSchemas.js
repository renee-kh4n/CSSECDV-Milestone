const { z } = require('zod');

const registerSchema = z.object({
    firstName: z.string().trim().min(2, 'First name is too short').max(50)
        .regex(/^[A-Za-z\s'-]+$/, 'First name must only contain letters, spaces, hyphens, and apostrophes')
        .regex(/^(?!.*\s{2,}).*$/, "First name cannot contain multiple consecutive spaces"),
    lastName: z.string().trim().min(2, 'Last name is too short').max(50)
        .regex(/^[A-Za-z\s'-]+$/, 'Last name must only contain letters, spaces, hyphens, and apostrophes')
        .regex(/^(?!.*\s{2,}).*$/, "Last name cannot contain multiple consecutive spaces"),
    email: z.email('Invalid email format').trim().toLowerCase(),
    phoneNumber: z.string().trim().min(1).regex(/^(09\d{9}|9\d{9})$/, 'Enter a valid Philippine phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
        .regex(/^\S*$/, 'Password cannot contain spaces')
});

const loginSchema = z.object({
    email: z.email('Invalid credentials').trim().toLowerCase(),
    password: z.string().regex(/[0-9]/, 'Invalid credentials').regex(/[^a-zA-Z0-9]/, 'Invalid credentials')
});

module.exports = { registerSchema, loginSchema };
