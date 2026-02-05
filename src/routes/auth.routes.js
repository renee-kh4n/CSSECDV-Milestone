const express = require("express");
const multer = require('multer');
const pool = require('../db');
const supabase = require('../supabase');

const crypto = require('crypto');
const emailValidator = require('deep-email-validator');

async function validateUserEmail(email) {
  const result = await emailValidator.validate(email);

  if (result.valid) {
    return { success: true };
  } else {
    return { 
      success: false, 
      message: `Please provide a valid email. Failed at: ${result.reason}` 
    };
  }
}

const upload = multer();
const router = express.Router();

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access Denied!');
    }

}

function isLoggedin(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(403).send('Access Denied!');
    }

}

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});

router.get('/home', isLoggedin, (req, res) => {
    res.render('home', { title: 'Home Page' });
})

router.get('/profile', isLoggedin, (req, res) => {
    res.render('profile', { title: 'profile' });
})

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

router.get('/admin', isAdmin, async (req, res) => {
    try {
        const query = `SELECT * FROM users`;

        const result = await pool.query(query);

        const users = result.rows.map(u => ({
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phoneNumber: u.phone_number,
            pfp: u.pfp || '',
            role: u.role
        }));

        res.render('admin', { title: 'Admin Panel', users })

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }

});

router.post('/register', upload.single('pfp'), async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            return res.status(400).send('Missing required fields');
        }

        // Check if email already exists
        const checkMail = `SELECT user_ID FROM users WHERE email=$1`;

        const rows = await pool.query(checkMail, [email]);

        if (rows.rowCount > 0) {
            console.log("email exists");
            return res.render('register', {
                errorMessage: 'User with this email already exists!' // Error message passed to the frontend
            });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        // Generate unique filename
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        // Upload to Supabase bucket
        const { data, error } = await supabase.storage
            .from('pfp')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype
            });

        if (error) {
            console.error(error);
            return res.status(500).render('register', {
                errorMessage: 'Error uploading image'
            });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('pfp')
            .getPublicUrl(fileName);

        const imageUrl = publicUrlData.publicUrl;

        // Save imageUrl in database
        await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone_number, password, salt, pfp) 
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl]
        );

        return res.redirect('/login');

    } catch (err) {
        console.error(err);
        return res.status(500).render('register', {
            errorMessage: 'Server error'
        });
    }
});


router.post('/login', async (req, res) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Missing required fields');
        }

        const query = `SELECT user_ID, role, password, salt FROM users WHERE email=$1`;
        const rows = await pool.query(query, [email]);
        if (rows.rowCount < 1) {
            console.log("no email");
            return res.render('login', { errorMessage: 'Invalid credentials' });
        }

        const user = rows.rows[0];
        const { password: storedPasswordHash, salt } = user;

        // Hash the input password and compare it
        const inputPasswordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        if (inputPasswordHash === storedPasswordHash) {
            req.session.user = {
                id: user.user_ID,
                role: user.role
            };

            console.log("correct password");
            if (user.role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/home');
            }
        } else {
            console.log("wrong password");
            return res.render('login', { errorMessage: 'Invalid credentials' });
        }


    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }

})

/*
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).send('Missing required fields');
        }

        const query = `SELECT user_ID, role, password, salt FROM users WHERE email=$1`;
        const rows = await pool.query(query, [email]);

        if (rows.rowCount < 1) {
            return res.json({
                success: false
            });
        }

        const user = rows.rows[0];
        const { password: storedPasswordHash, salt } = user;

        // Hash the input password and compare it
        const inputPasswordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        if (inputPasswordHash === storedPasswordHash) {
            req.session.user = {
                id: user.user_ID,
                role: user.role
            };

            return res.json({
                success: true,
                role: user.role
            });
        } else {
            return res.json({
                success: false
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Handle form submission for registration
router.post('/register', upload.single('pfp'), async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            return res.status(400).send('Missing required fields');
        }

        const check = await validateUserEmail(email);
        if (!check.success) {
            return res.status(400).json(check);
        }

        // Check if email already exists
        const checkMail = `SELECT user_ID FROM users WHERE email=$1`;
        const rows = await pool.query(checkMail, [email]);

        if (rows.rowCount > 0) {
            return res.json({ success: false });
        }

        // Hash the password before saving
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        // Upload the profile picture to Supabase
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pfp').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }

        // Get public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage.from('pfp').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        // Insert new user into the database
        await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone_number, password, salt, pfp) 
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl]
        );

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
});
*/
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

module.exports = router;