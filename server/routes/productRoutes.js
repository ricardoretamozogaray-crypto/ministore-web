const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductByCode,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    bulkDeleteProducts,
    bulkUpdateProducts,

} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllProducts);
router.get('/low-stock', verifyToken, getLowStockProducts);
router.get('/code/:code', verifyToken, getProductByCode);
router.post('/', verifyToken, isAdmin, createProduct);
router.post('/bulk/delete', verifyToken, isAdmin, bulkDeleteProducts); // New
router.post('/bulk/update', verifyToken, isAdmin, bulkUpdateProducts); // New
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
