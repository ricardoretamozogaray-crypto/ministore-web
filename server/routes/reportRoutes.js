const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesByDate, getTopProducts, getSalesReport } = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, getDashboardStats);
router.get('/sales-by-date', verifyToken, isAdmin, getSalesByDate);
router.get('/top-products', verifyToken, isAdmin, getTopProducts);
router.get('/sales', verifyToken, isAdmin, getSalesReport);

module.exports = router;
