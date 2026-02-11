const crypto = require('crypto');

const userModel = require('../models/userModel');

const supabase = require('../supabase');

const { z } = require('zod');

exports.showLoginPage = (req, res) => {
    res.render('login', { title: 'Login' });
};

exports.showRegisterPage = (req, res) => {
    res.render('register', { title: 'Register' });
};

const registerSchema = z.object({
    firstName: z.string().min(2, "First name is too short").max(50).trim(),
    lastName: z.string().min(2, "Last name is too short").max(50).trim(),
    email: z.string().email({ message: "Invalid email format" }).trim().toLowerCase(),
    phoneNumber: z.string()
        .trim()
        .regex(
            /^(0\d{10}|\d{10})$/, 
            "Enter a valid Philippine phone number"
        ),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});

exports.registerUser = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);
        
        if (!result.success) {
            req.flash('error', result.error.issues[0].message);
            return res.status(400).redirect('/register');
        }

        const { firstName, lastName, email, phoneNumber, password } = result.data;

        if (!req.file) {
            req.flash('error', 'No image uploaded');
            return res.status(400).redirect('/register');
        }

        const userAlreadyExists = await userModel.userExists(email);
        if (userAlreadyExists) {
            req.flash('error', 'User with this email already exists!');
            return res.status(400).redirect('/register');
        }

        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
            req.flash('error', 'Invalid file type. Only JPG and PNG are allowed.');
            return res.status(400).redirect('/register');
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 4096, 64, 'sha512').toString('hex');

        const fileExt = type.ext;
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pfp').upload(fileName, req.file.buffer, { contentType: type.mime });

        if (error) {
            console.error(error);
            req.flash('error', 'Server error');
            return res.status(500).redirect('/register');
        }

        const { data: publicUrlData } = supabase.storage.from('pfp').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        await userModel.createUser(firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl);

        return res.redirect('/login');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Server error');
        return res.status(500).redirect('/register');
    }
};

const loginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string()
        .min(8)
        .regex(/[0-9]/)
        .regex(/[^a-zA-Z0-9]/)
});

exports.loginUser = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            req.flash('error', 'Invalid credentials');
            return res.status(400).redirect('/login');
        }

        const { email, password } = result.data;

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.status(400).redirect('/login');
        }

        const { password: storedPasswordHash, salt } = user;
        const inputPasswordHash = crypto.pbkdf2Sync(password, salt, 4096, 64, 'sha512').toString('hex');

        if (inputPasswordHash === storedPasswordHash) {
            req.session.user = {
                role: user.role
            };
            
            if (user.role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/home');
            }
        } else {
            req.flash('error', 'Invalid credentials');
            return res.status(400).redirect('/login');
        }
    } catch (err) {
        req.flash('error', 'Server error');
        return res.status(500).redirect('/login');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('cssecdv.sid');
        return res.redirect('/login');
    });
};
