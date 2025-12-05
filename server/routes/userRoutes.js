const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser } = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/list', verifyToken, isAdmin, getAllUsers);
router.put('/:id', verifyToken, isAdmin, updateUser);

module.exports = router;
