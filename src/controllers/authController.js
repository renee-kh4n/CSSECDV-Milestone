const crypto = require('crypto');

const userModel = require('../models/userModel');

const supabase = require('../supabase');

exports.showLoginPage = (req, res) => {
    res.render('login', { title: 'Login'});
};

exports.showRegisterPage = (req, res) => {
    res.render('register', { title: 'Register'});
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
        const { firstName, lastName, email, phoneNumber, password } = result.data;

        if (!req.file) {
            req.session.errorMessage = 'No image uploaded';
            return res.redirect('/register');
        }

        const userAlreadyExists = await userModel.userExists(email);
        if (userAlreadyExists) {
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/register');
        }

        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
            req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
            return res.redirect('/register');
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');

        const fileExt = type.ext;
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pfp').upload(fileName, req.file.buffer, { contentType: type.mime });

        if (error) {
            req.session.errorMessage = 'Server error';
            return res.redirect('/register');
        }

        const { data: publicUrlData } = supabase.storage.from('pfp').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        await userModel.createUser(firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl);

        return res.redirect('/login');

    } catch (err) {
        req.session.errorMessage = 'Server error';
        return res.redirect('/register');
    }
};  

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = result.data;

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/login');
        }

        const { password: storedPasswordHash, salt } = user;
        const inputPasswordHash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');

        if (inputPasswordHash === storedPasswordHash) {
            req.session.user = {
                role: user.role,
                email: email
            };
            
            if (user.role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/home');
            }
        } else {
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/login');
        }
    } catch (err) {
        req.session.errorMessage = 'Server error';
        return res.redirect('/login');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('cssecdv.sid');
        return res.redirect('/login');
    });
};
