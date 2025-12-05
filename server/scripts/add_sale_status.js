const { pool } = require('../config/db');

const applyChanges = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Altering sales table...');
        await client.query(`
      ALTER TABLE sales 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'completed';
    `);

        await client.query('COMMIT');
        console.log('Database changes applied successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error applying changes:', err);
    } finally {
        client.release();
        process.exit();
    }
};

applyChanges();
