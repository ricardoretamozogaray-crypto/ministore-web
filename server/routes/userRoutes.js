const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/list', verifyToken, isAdmin, getAllUsers);

module.exports = router;
