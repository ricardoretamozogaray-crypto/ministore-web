const { pool } = require('../config/db');

const applyChanges = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Altering products table...');
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS unit_type VARCHAR(10) NOT NULL DEFAULT 'unit';
    `);

    await client.query(`
      ALTER TABLE products 
      ALTER COLUMN stock TYPE DECIMAL(10, 3);
    `);

    await client.query(`
      ALTER TABLE products 
      ALTER COLUMN min_stock TYPE DECIMAL(10, 3);
    `);

    console.log('Altering sale_items table...');
    await client.query(`
      ALTER TABLE sale_items 
      ALTER COLUMN quantity TYPE DECIMAL(10, 3);
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
