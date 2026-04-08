const pool = require('../db');

const userExists = async (email) => {
    const result = await pool.query('SELECT user_ID FROM users WHERE email = $1', [email]);
    return result.rowCount > 0;
};

const createUser = async (firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl) => {
    await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone_number, password, salt, pfp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [firstName, lastName, email, phoneNumber, passwordHash, salt, imageUrl]
    );
};

const getUserByEmail = async (email) => {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
};

const getUserById = async (userId) => {
    const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    return result.rows[0];
};

const getAllUsers = async () => {   
    const result = await pool.query(`SELECT * FROM users`);
    return result.rows; 
};

module.exports = {
    userExists,
    createUser,
    getUserByEmail,
    getUserById,
    getAllUsers  
};
