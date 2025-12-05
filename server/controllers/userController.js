const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const result = await query('SELECT id, username, role FROM users ORDER BY username ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Prevent users from editing themselves (extra safety layer)
    if (parseInt(id) === req.user.id) {
        return res.status(403).json({ message: 'No puedes editar tu propio usuario desde este panel.' });
    }

    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllUsers, updateUser };
