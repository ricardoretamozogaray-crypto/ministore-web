const { query } = require('../config/db');

const getAllProducts = async (req, res) => {
    try {
        const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProductByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const result = await query('SELECT * FROM products WHERE code = $1', [code]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Helper to generate next code
const generateProductCode = async () => {
    try {
        const result = await query('SELECT code FROM products ORDER BY id DESC LIMIT 1');
        if (result.rows.length === 0) return 'PROD-0001';

        const lastCode = result.rows[0].code;
        const match = lastCode.match(/PROD-(\d+)/);

        if (!match) return `PROD-${Date.now()}`; // Fallback if format is different

        const nextNum = parseInt(match[1], 10) + 1;
        return `PROD-${String(nextNum).padStart(4, '0')}`;
    } catch (err) {
        console.error('Error generating code:', err);
        return `PROD-${Date.now()}`;
    }
};

const createProduct = async (req, res) => {
    const { name, description, price, cost, stock, min_stock, category_id, image_url } = req.body;

    try {
        // Check if name exists
        const nameCheck = await query('SELECT id FROM products WHERE name = $1', [name]);
        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product name already exists' });
        }

        const code = await generateProductCode();

        const result = await query(
            `INSERT INTO products (code, name, description, price, cost, stock, min_stock, category_id, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [code, name, description, price, cost || 0, stock, min_stock || 0, category_id, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, cost, stock, min_stock, category_id, image_url } = req.body;

    try {
        // Check if name exists for other products
        const nameCheck = await query('SELECT id FROM products WHERE name = $1 AND id != $2', [name, id]);
        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product name already exists' });
        }

        // Code is NOT updated
        const result = await query(
            `UPDATE products 
       SET name = $1, description = $2, price = $3, cost = $4, stock = $5, min_stock = $6, category_id = $7, image_url = $8 
       WHERE id = $9 RETURNING *`,
            [name, description, price, cost || 0, stock, min_stock || 0, category_id, image_url, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getLowStockProducts = async (req, res) => {
    try {
        const result = await query('SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllProducts, getProductByCode, createProduct, updateProduct, deleteProduct, getLowStockProducts };
