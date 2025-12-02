const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
// Public registration for now (was protected)
router.post('/register', verifyToken, isAdmin, register);

module.exports = router;
