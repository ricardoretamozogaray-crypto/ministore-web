const { pool } = require('../config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Adding status column to sale_items table...');

        // Add status column if it doesn't exist
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'status') THEN 
                    ALTER TABLE sale_items ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'; 
                END IF; 
            END $$;
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
