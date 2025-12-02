const express = require('express');
const router = express.Router();
const { getAllProducts, getProductByCode, createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllProducts);
router.get('/low-stock', verifyToken, getLowStockProducts);
router.get('/code/:code', verifyToken, getProductByCode);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
