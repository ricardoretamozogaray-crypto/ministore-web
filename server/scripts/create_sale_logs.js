const { pool } = require('../config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Creating sale_logs table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS sale_logs (
                id SERIAL PRIMARY KEY,
                sale_id INTEGER REFERENCES sales(id),
                sale_item_id INTEGER REFERENCES sale_items(id),
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(50) NOT NULL,
                quantity DECIMAL(10, 3),
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
