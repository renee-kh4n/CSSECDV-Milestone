const pool = require('../db');

const ensureBanColumnExists = async () => {
    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE
    `);
};

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
    await ensureBanColumnExists();
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
};

const getUserById = async (userId) => {
    await ensureBanColumnExists();
    const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    return result.rows[0];
};

const getAllUsers = async () => {   
    const result = await pool.query(`SELECT * FROM users`);
    return result.rows; 
};

const searchUsers = async (query = '') => {
    await ensureBanColumnExists();

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
        const result = await pool.query(`
            SELECT user_id, first_name, last_name, email, role, COALESCE(is_banned, FALSE) AS is_banned
            FROM users
            ORDER BY first_name ASC, last_name ASC
            LIMIT 50
        `);
        return result.rows;
    }

    const searchPattern = `%${normalizedQuery}%`;
    const result = await pool.query(
        `
        SELECT user_id, first_name, last_name, email, role, COALESCE(is_banned, FALSE) AS is_banned
        FROM users
        WHERE first_name ILIKE $1
           OR last_name ILIKE $1
           OR email ILIKE $1
        ORDER BY first_name ASC, last_name ASC
        LIMIT 50
        `,
        [searchPattern]
    );

    return result.rows;
};

const getBannedUsers = async () => {
    await ensureBanColumnExists();

    const result = await pool.query(`
        SELECT user_id, first_name, last_name, email
        FROM users
        WHERE COALESCE(is_banned, FALSE) = TRUE
        ORDER BY first_name ASC, last_name ASC
    `);
    return result.rows;
};

const setUserBanStatus = async (userId, isBanned) => {
    await ensureBanColumnExists();

    const result = await pool.query(
        `
        UPDATE users
        SET is_banned = $2
        WHERE user_id = $1 AND role <> 'admin'
        RETURNING user_id, first_name, last_name, email, is_banned
        `,
        [userId, isBanned]
    );
    return result.rows[0] || null;
};

module.exports = {
    userExists,
    createUser,
    getUserByEmail,
    getUserById,
    getAllUsers,
    searchUsers,
    getBannedUsers,
    setUserBanStatus
};
