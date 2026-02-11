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
            return res.status(400).render('register', { 
                errorMessage: result.error.issues[0].message
            });
        }

        const { firstName, lastName, email, phoneNumber, password } = result.data;

        if (!req.file) {
            return res.status(400).render('register', { errorMessage: 'No image uploaded' });
        }

        const userAlreadyExists = await userModel.userExists(email);
        if (userAlreadyExists) {
            return res.render('register', {
                errorMessage: 'User with this email already exists!'
            });
        }

        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
            return res.status(400).render('register', { errorMessage: 'Invalid file type. Only JPG and PNG are allowed.' });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 4096, 64, 'sha512').toString('hex');

        const fileExt = type.ext;
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pfp').upload(fileName, req.file.buffer, { contentType: type.mime });

        if (error) {
            console.error(error);
            return res.status(500).render('register', { errorMessage: 'Server error' });
        }

        const { data: publicUrlData } = supabase.storage.from('pfp').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        await userModel.createUser(firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl);

        return res.redirect('/login');

    } catch (err) {
        console.error(err);
        return res.status(500).render('register', { errorMessage: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.render('login', { errorMessage: 'Invalid credentials' });
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
            return res.render('login', { errorMessage: 'Invalid credentials' });
        }
    } catch (err) {
        return res.status(500).render('login', { errorMessage: 'Server error' });
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('cssecdv.sid');
        return res.redirect('/login');
    });
};
