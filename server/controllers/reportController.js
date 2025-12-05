const { query } = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const salesRes = await query("SELECT SUM(total) as total_sales FROM sales WHERE status != 'cancelled'");
        const ordersRes = await query("SELECT COUNT(*) as total_orders FROM sales WHERE status != 'cancelled'");
        const productsRes = await query('SELECT COUNT(*) as total_products FROM products');
        const lowStockRes = await query('SELECT COUNT(*) as low_stock FROM products WHERE stock <= min_stock');

        res.json({
            totalSales: Number(salesRes.rows[0].total_sales) || 0,
            totalOrders: Number(ordersRes.rows[0].total_orders) || 0,
            totalProducts: Number(productsRes.rows[0].total_products) || 0,
            lowStock: Number(lowStockRes.rows[0].low_stock) || 0,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSalesByDate = async (req, res) => {
    try {
        const result = await query(`
      SELECT DATE(created_at) as date, SUM(total) as total
      FROM sales
      WHERE created_at >= NOW() - INTERVAL '7 days' AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const result = await query(`
      SELECT p.name, SUM(si.quantity) as total_sold
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSalesReport = async (req, res) => {
    const { startDate, endDate, userId } = req.query;

    try {
        let queryStr = `
      SELECT 
        s.id as sale_id,
        s.created_at,
        s.total as sale_total,
        s.status,
        u.username as seller_name,
        json_agg(json_build_object(
          'id', si.id,
          'product_name', p.name,
          'quantity', si.quantity,
          'price', si.price,
          'cost', p.cost,
          'subtotal', (si.price * si.quantity),
          'profit', ((si.price - COALESCE(p.cost, 0)) * si.quantity),
          'status', si.status
        )) as items
      FROM sales s
      JOIN users u ON s.user_id = u.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 1;

        if (startDate) {
            queryStr += ` AND s.created_at >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }

        if (endDate) {
            queryStr += ` AND s.created_at <= $${paramCount}`;
            params.push(endDate + ' 23:59:59'); // Include the whole end day
            paramCount++;
        }

        if (userId && userId !== 'all') {
            queryStr += ` AND s.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        queryStr += ` GROUP BY s.id, s.created_at, s.total, s.status, u.username ORDER BY s.created_at DESC`;

        const result = await query(queryStr, params);

        // Calculate totals
        let totalRevenue = 0;
        let totalProfit = 0;
        let totalSales = result.rows.filter(s => s.status !== 'cancelled').length;

        const sales = result.rows.map(sale => {
            const saleProfit = sale.items.reduce((acc, item) => {
                return item.status !== 'cancelled' ? acc + Number(item.profit) : acc;
            }, 0);

            if (sale.status !== 'cancelled') {
                totalRevenue += Number(sale.sale_total);
                totalProfit += saleProfit;
            }

            return {
                ...sale,
                sale_profit: saleProfit
            };
        });

        res.json({
            summary: {
                totalSales,
                totalRevenue,
                totalProfit
            },
            sales
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getDashboardStats, getSalesByDate, getTopProducts, getSalesReport };
