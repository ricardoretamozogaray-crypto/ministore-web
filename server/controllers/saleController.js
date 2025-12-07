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



const logSaleAction = async (client, saleId, userId, action, quantity = null, saleItemId = null, reason = null) => {
    await client.query(
        'INSERT INTO sale_logs (sale_id, user_id, action, quantity, sale_item_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
        [saleId, userId, action, quantity, saleItemId, reason]
    );
};

const cancelSale = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if sale exists and is not already cancelled
        const saleRes = await client.query('SELECT * FROM sales WHERE id = $1', [id]);
        if (saleRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Sale not found' });
        }

        const sale = saleRes.rows[0];
        if (sale.status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Sale is already cancelled' });
        }

        // Get Sale Items
        const itemsRes = await client.query('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
        const items = itemsRes.rows;

        // Restore Stock (Only for active items to avoid double restoration)
        for (const item of items) {
            if (item.status === 'active') {
                await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [Number(item.quantity), item.product_id]);
                // Mark item as cancelled too so individual status is consistent
                await client.query('UPDATE sale_items SET status = $1 WHERE id = $2', ['cancelled', item.id]);
            }
        }

        // Update Sale Status
        await client.query('UPDATE sales SET status = $1 WHERE id = $2', ['cancelled', id]);

        // Log Action
        await logSaleAction(client, id, userId, 'CANCEL_SALE');

        await client.query('COMMIT');
        res.json({ message: 'Sale cancelled successfully' });
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
      SELECT 
        s.id, s.total, s.payment_method, s.status, s.created_at, u.username,
        json_agg(
            json_build_object(
                'id', si.id,
                'product_name', p.name,
                'quantity', si.quantity,
                'price', si.price,
                'subtotal', si.subtotal,
                'status', si.status
            )
        ) as items
      FROM sales s
      JOIN users u ON s.user_id = u.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      GROUP BY s.id, u.username
      ORDER BY s.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const cancelSaleItem = async (req, res) => {
    const { saleId, itemId } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validate Sale and Item
        const itemRes = await client.query('SELECT * FROM sale_items WHERE id = $1 AND sale_id = $2', [itemId, saleId]);
        if (itemRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Item not found in this sale' });
        }

        const item = itemRes.rows[0];
        if (item.status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Item is already cancelled' });
        }

        // 2. Restore Stock
        await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);

        // 3. Update Item Status
        await client.query('UPDATE sale_items SET status = $1 WHERE id = $2', ['cancelled', itemId]);

        // 4. Recalculate Sale Total
        const activeItemsRes = await client.query('SELECT * FROM sale_items WHERE sale_id = $1 AND status = $2', [saleId, 'active']);
        const activeItems = activeItemsRes.rows;

        let newTotal = 0;
        if (activeItems.length > 0) {
            newTotal = activeItems.reduce((sum, i) => sum + Number(i.subtotal), 0);
            // Update Sale Total
            await client.query('UPDATE sales SET total = $1 WHERE id = $2', [newTotal, saleId]);
        } else {
            // 5. Auto-Cancel Sale if no active items
            await client.query('UPDATE sales SET status = $1, total = 0 WHERE id = $2', ['cancelled', saleId]);
        }

        // Log Action
        await logSaleAction(client, saleId, userId, 'CANCEL_ITEM', item.quantity, itemId);

        await client.query('COMMIT');
        res.json({ message: 'Item cancelled successfully', newTotal });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

const restoreSaleItem = async (req, res) => {
    const { saleId, itemId } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validate Item
        const itemRes = await client.query('SELECT * FROM sale_items WHERE id = $1 AND sale_id = $2', [itemId, saleId]);
        if (itemRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Item not found' });
        }
        const item = itemRes.rows[0];

        if (item.status !== 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Item is not cancelled' });
        }

        // 2. Check Stock
        const productRes = await client.query('SELECT stock, name FROM products WHERE id = $1', [item.product_id]);
        const product = productRes.rows[0];

        if (product.stock < item.quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
        }

        // 3. Deduct Stock
        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);

        // 4. Update Item Status
        await client.query('UPDATE sale_items SET status = $1 WHERE id = $2', ['active', itemId]);

        // 5. Recalculate Sale Total
        const activeItemsRes = await client.query('SELECT * FROM sale_items WHERE sale_id = $1 AND status = $2', [saleId, 'active']);
        const activeItems = activeItemsRes.rows;
        const newTotal = activeItems.reduce((sum, i) => sum + Number(i.subtotal), 0);

        // 6. Update Sale Status and Total
        // If sale was cancelled, it becomes completed because it now has active items
        await client.query('UPDATE sales SET status = $1, total = $2 WHERE id = $3', ['completed', newTotal, saleId]);

        // Log Action
        await logSaleAction(client, saleId, userId, 'RESTORE_ITEM', item.quantity, itemId);

        await client.query('COMMIT');
        res.json({ message: 'Item restored successfully', newTotal });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

const restoreSale = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validate Sale
        const saleRes = await client.query('SELECT * FROM sales WHERE id = $1', [id]);
        if (saleRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Sale not found' });
        }
        const sale = saleRes.rows[0];

        if (sale.status !== 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Sale is not cancelled' });
        }

        // 2. Get All Items (Active and Cancelled)
        // Actually we only want to restore items that were part of the sale. 
        // If the sale is cancelled, usually all items are effectively cancelled or the sale status overrides.
        // But if we have mixed states, we should probably restore ALL items to make the sale fully valid.
        // Let's assume we restore ALL items belonging to this sale.
        const itemsRes = await client.query('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
        const items = itemsRes.rows;

        // 3. Check Stock for ALL items
        for (const item of items) {
            // Only check stock if we need to restore it (i.e., if we are going to deduct it)
            // If the item is already active (which shouldn't happen in a cancelled sale, but good to be safe), we skip?
            // No, if sale is cancelled, we assume we need to re-deduct everything.
            // Wait, if an item was individually cancelled BEFORE the sale was cancelled, should we restore it?
            // The requirement says "Restaurar una venta completa: Debe reactivar la venta y todos sus productos."
            // So yes, we restore everything.

            const productRes = await client.query('SELECT stock, name FROM products WHERE id = $1', [item.product_id]);
            const product = productRes.rows[0];

            if (product.stock < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }
        }

        // 4. Deduct Stock and Update Status
        let newTotal = 0;
        for (const item of items) {
            await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
            await client.query('UPDATE sale_items SET status = $1 WHERE id = $2', ['active', item.id]);
            newTotal += Number(item.subtotal);
        }

        // 5. Update Sale Status
        await client.query('UPDATE sales SET status = $1, total = $2 WHERE id = $3', ['completed', newTotal, id]);

        // Log Action
        await logSaleAction(client, id, userId, 'RESTORE_SALE');

        await client.query('COMMIT');
        res.json({ message: 'Sale restored successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

module.exports = { createSale, getSales, cancelSale, cancelSaleItem, restoreSale, restoreSaleItem };
