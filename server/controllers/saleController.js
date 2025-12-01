const { pool } = require('../config/db');

const createSale = async (req, res) => {
    const { items, payment_method } = req.body; // items: [{ product_id, quantity, price }]
    const user_id = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create Sale
        const saleResult = await client.query(
            'INSERT INTO sales (user_id, total, payment_method) VALUES ($1, $2, $3) RETURNING id',
            [user_id, total, payment_method]
        );
        const saleId = saleResult.rows[0].id;

        // Process Items
        for (const item of items) {
            // Check Stock
            const productRes = await client.query('SELECT stock FROM products WHERE id = $1', [item.product_id]);
            if (productRes.rows.length === 0) throw new Error(`Product ${item.product_id} not found`);

            const currentStock = productRes.rows[0].stock;
            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            // Update Stock
            await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);

            // Create Sale Item
            await client.query(
                'INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [saleId, item.product_id, item.quantity, item.price, item.quantity * item.price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Sale completed successfully', saleId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

const getSales = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT s.id, s.total, s.payment_method, s.created_at, u.username 
      FROM sales s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createSale, getSales };
