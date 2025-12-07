const { query } = require('../config/db');

const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            category_id,
            stock_status,
            min_price,
            max_price,
            min_stock,
            max_stock,
            unit_type,
            sort_by = 'id',
            order = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let queryStr = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;

        // Filters
        if (search) {
            params.push(`%${search}%`);
            queryStr += ` AND (p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`;
        }

        if (category_id) {
            params.push(category_id);
            queryStr += ` AND p.category_id = $${params.length}`;
        }

        if (unit_type) {
            params.push(unit_type);
            queryStr += ` AND p.unit_type = $${params.length}`;
        }

        if (min_price) {
            params.push(min_price);
            queryStr += ` AND p.price >= $${params.length}`;
        }

        if (max_price) {
            params.push(max_price);
            queryStr += ` AND p.price <= $${params.length}`;
        }

        if (min_stock) {
            params.push(min_stock);
            queryStr += ` AND p.stock >= $${params.length}`;
        }

        if (max_stock) {
            params.push(max_stock);
            queryStr += ` AND p.stock <= $${params.length}`;
        }

        if (stock_status) {
            if (stock_status === 'in_stock') {
                queryStr += ` AND p.stock > 0`;
            } else if (stock_status === 'out_of_stock') {
                queryStr += ` AND p.stock <= 0`;
            } else if (stock_status === 'low_stock') {
                queryStr += ` AND p.stock <= p.min_stock AND p.stock > 0`;
            }
        }

        // Metrics Calculation (based on filtered data)
        // We need a separate query for metrics to avoid pagination limits affecting the totals
        // However, for performance on large datasets, we might want to cache this or do it differently.
        // For now, let's run a count/sum query with the same WHERE clause.

        let metricsQuery = `
            SELECT 
                COUNT(*) as total_products,
                SUM(p.price * p.stock) as total_value,
                SUM(p.cost * p.stock) as total_cost,
                SUM((p.price - p.cost) * p.stock) as potential_profit
            FROM products p
            WHERE 1=1
        `;

        // Re-apply filters to metrics query (excluding pagination/sort)
        // Note: We need to reconstruct the WHERE clause or reuse the logic.
        // To be safe and clean, let's reuse the WHERE part from queryStr.
        const whereClause = queryStr.split('WHERE 1=1')[1];
        metricsQuery += whereClause;

        const metricsRes = await query(metricsQuery, params);
        const metrics = {
            total_products: parseInt(metricsRes.rows[0].total_products || 0),
            total_value: parseFloat(metricsRes.rows[0].total_value || 0),
            total_cost: parseFloat(metricsRes.rows[0].total_cost || 0),
            potential_profit: parseFloat(metricsRes.rows[0].potential_profit || 0)
        };

        // Sorting
        const validSortColumns = ['id', 'name', 'price', 'cost', 'stock', 'created_at', 'category_name'];
        const sortByClean = validSortColumns.includes(sort_by) ? sort_by : 'id';
        const orderClean = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Handle sorting by joined column
        let sortColumn = `p.${sortByClean}`;
        if (sortByClean === 'category_name') sortColumn = 'c.name';

        queryStr += ` ORDER BY ${sortColumn} ${orderClean}`;

        // Pagination
        params.push(limit);
        queryStr += ` LIMIT $${params.length}`;

        params.push(offset);
        queryStr += ` OFFSET $${params.length}`;

        const result = await query(queryStr, params);

        res.json({
            data: result.rows,
            pagination: {
                total: metrics.total_products,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(metrics.total_products / limit)
            },
            metrics
        });

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
    const { name, description, price, cost, stock, min_stock, category_id, image_url, unit_type } = req.body;

    // Validation
    const validUnits = ['unit', 'kg'];
    if (unit_type && !validUnits.includes(unit_type)) {
        return res.status(400).json({ message: 'Tipo de unidad inválido' });
    }
    if (Number(price) < 0 || Number(cost) < 0 || Number(stock) < 0 || Number(min_stock) < 0) {
        return res.status(400).json({ message: 'No se permiten valores negativos' });
    }

    try {
        // Check if name exists
        const nameCheck = await query('SELECT id FROM products WHERE name = $1', [name]);
        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product name already exists' });
        }

        const code = await generateProductCode();

        const result = await query(
            `INSERT INTO products (code, name, description, price, cost, stock, min_stock, category_id, image_url, unit_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [code, name, description, price, cost || 0, stock, min_stock || 0, category_id, image_url, unit_type || 'unit']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, cost, stock, min_stock, category_id, image_url, unit_type } = req.body;

    // Validation
    const validUnits = ['unit', 'kg'];
    if (unit_type && !validUnits.includes(unit_type)) {
        return res.status(400).json({ message: 'Tipo de unidad inválido' });
    }
    if (Number(price) < 0 || Number(cost) < 0 || Number(stock) < 0 || Number(min_stock) < 0) {
        return res.status(400).json({ message: 'No se permiten valores negativos' });
    }

    try {
        // Check if name exists for other products
        const nameCheck = await query('SELECT id FROM products WHERE name = $1 AND id != $2', [name, id]);
        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Product name already exists' });
        }

        // Code is NOT updated
        const result = await query(
            `UPDATE products 
       SET name = $1, description = $2, price = $3, cost = $4, stock = $5, min_stock = $6, category_id = $7, image_url = $8, unit_type = $9 
       WHERE id = $10 RETURNING *`,
            [name, description, price, cost || 0, stock, min_stock || 0, category_id, image_url, unit_type || 'unit', id]
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

const bulkDeleteProducts = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs provided' });
    }

    try {
        await query('BEGIN');
        // Delete products
        // Note: This might fail if there are foreign key constraints (e.g. sales).
        // Ideally we should soft delete or check constraints.
        // For now, let's assume hard delete is requested but we catch errors.

        const result = await query('DELETE FROM products WHERE id = ANY($1) RETURNING id', [ids]);

        await query('COMMIT');
        res.json({ message: 'Products deleted successfully', count: result.rowCount, deletedIds: result.rows.map(r => r.id) });
    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting products: ' + err.message });
    }
};

const bulkUpdateProducts = async (req, res) => {
    const { ids, action, value } = req.body;
    // action: 'update_category', 'update_stock_add', 'update_stock_set', 'update_unit_type'

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs provided' });
    }

    try {
        await query('BEGIN');
        let queryStr = '';
        let params = [value, ids];

        if (action === 'update_category') {
            queryStr = 'UPDATE products SET category_id = $1 WHERE id = ANY($2)';
        } else if (action === 'update_stock_set') {
            queryStr = 'UPDATE products SET stock = $1 WHERE id = ANY($2)';
        } else if (action === 'update_stock_add') {
            queryStr = 'UPDATE products SET stock = stock + $1 WHERE id = ANY($2)';
        } else if (action === 'update_unit_type') {
            queryStr = 'UPDATE products SET unit_type = $1 WHERE id = ANY($2)';
        } else {
            throw new Error('Invalid action');
        }

        const result = await query(queryStr, params);
        await query('COMMIT');
        res.json({ message: 'Products updated successfully', count: result.rowCount });
    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ message: 'Error updating products: ' + err.message });
    }
};

module.exports = {
    getAllProducts,
    getProductByCode,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    bulkDeleteProducts,
    bulkUpdateProducts
};
