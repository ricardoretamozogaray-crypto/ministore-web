const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createSale);
router.get('/', verifyToken, getSales);

module.exports = router;
