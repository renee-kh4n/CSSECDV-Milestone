const crypto = require('crypto');

const userModel = require('../models/userModel');

const supabase = require('../supabase');

const logger = require('../logger');


exports.showLoginPage = (req, res) => {
    logger.info(`LOGIN_VIEW | user=${req.session.user?.id} | ip=${req.ip}`);
    if (req.query.timeout === '1') {
        req.session.errorMessage = 'Session expired due to inactivity.';
    }
    res.render('login', { title: 'Login' });
};

exports.showRegisterPage = (req, res) => {
    logger.info(`REGISTER_VIEW | user=${req.session.user?.id} | ip=${req.ip}`);
    res.render('register', { title: 'Register' });
};

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.data;

        if (!req.file) {
            logger.warn(
                `REGISTER_FAIL | email=${email} | reason=no_image | ip=${req.ip}`,
            );
            req.session.errorMessage = 'No image uploaded';
            return res.redirect('/register');
        }

        const userAlreadyExists = await userModel.userExists(email);
        if (userAlreadyExists) {
            logger.warn(
                `REGISTER_FAIL | email=${email} | reason=email_exists | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/register');
        }

        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
            logger.warn(
                `REGISTER_FAIL | email=${email} | reason=invalid_file_type | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid file type. Only JPG and PNG are allowed.';
            return res.redirect('/register');
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');

        const fileExt = type.ext;
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pfp').upload(fileName, req.file.buffer, { contentType: type.mime });

        if (error) {
            logger.error(
                `REGISTER_ERROR | email=${email} | ip=${req.ip} | error=${error.stack || error}`,
            );
            req.session.errorMessage = 'Server error';
            return res.redirect('/register');
        }

        const { data: publicUrlData } = supabase.storage.from('pfp').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        await userModel.createUser(firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl);

        logger.info(
            `LOGIN | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect('/login');
    } catch (err) {
        logger.error(
            `REGISTER_ERROR | email=${req?.data?.email} | ip=${req.ip} | error=${error.stack || error}`,
        );
        req.session.errorMessage = 'Server error';
        return res.redirect('/register');
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.data;

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            logger.warn(
                `LOGIN_FAIL | email=${email} | reason=no_user | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/login');
        }

        const { password: storedPasswordHash, salt } = user;
        const inputPasswordHash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');

        if (inputPasswordHash === storedPasswordHash) {
            req.session.regenerate((err) => {
                if (err) {
                    logger.error(
                        `SESSION_REGENERATE_ERROR | email=${email} | ip=${req.ip} | error=${err.stack || err}`,
                    );
                    req.session.errorMessage = 'Server error';
                    return res.redirect('/login');
                }

                req.session.user = {
                    role: user.role,
                    id: user.user_id
                };

                logger.info(
                    `LOGIN_SUCCESS | email=${email} | role=${user.role} | ip=${req.ip}`,
                );

                if (user.role === 'admin') {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/home');
                }
            });
        } else {
            logger.warn(
                `LOGIN_FAIL | email=${email} | reason=bad_password | ip=${req.ip}`,
            );
            req.session.errorMessage = 'Invalid credentials';
            return res.redirect('/login');
        }
    } catch (err) {
        logger.error(
            `LOGIN_ERROR | id=${req?.session?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        req.session.errorMessage = 'Server error';
        return res.redirect('/login');
    }
};

exports.logoutUser = (req, res) => {
    logger.info(`LOGOUT | email=${req.session.user.email} | ip=${req.ip}`);
    req.session.destroy(err => {
        res.clearCookie('id');
        return res.redirect('/login');
    });
};
