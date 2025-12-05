const express = require('express');
const router = express.Router();
const { createSale, getSales, cancelSale, cancelSaleItem, restoreSale, restoreSaleItem } = require('../controllers/saleController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createSale);
router.get('/', verifyToken, getSales);
router.post('/:id/cancel', verifyToken, isAdmin, cancelSale);
router.post('/:saleId/items/:itemId/cancel', verifyToken, isAdmin, cancelSaleItem);
router.post('/:id/restore', verifyToken, isAdmin, restoreSale);
router.post('/:saleId/items/:itemId/restore', verifyToken, isAdmin, restoreSaleItem);

module.exports = router;
