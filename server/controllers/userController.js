const { query } = require('../config/db');

const getAllUsers = async (req, res) => {
    try {
        const result = await query('SELECT id, username, role FROM users ORDER BY username ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllUsers };
