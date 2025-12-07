const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'store_db',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating indices for products table...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name_code ON products(name, code);`);



        await client.query('COMMIT');
        console.log('Migration completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
