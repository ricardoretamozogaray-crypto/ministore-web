const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

const bcrypt = require('bcryptjs');

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Initializing database...');
        await pool.query(schemaSql);
        console.log('Database initialized successfully');

        // Check for Secret Seed File (e.g., from Render Secret Files)
        const secretSeedPath = process.env.SEED_FILE_PATH || '/etc/secrets/seed.sql';
        if (fs.existsSync(secretSeedPath)) {
            console.log(`Found secret seed file at ${secretSeedPath}. Executing...`);
            const secretSql = fs.readFileSync(secretSeedPath, 'utf8');
            await pool.query(secretSql);
            console.log('Secret seed executed successfully');
        } else {
            console.log(`No secret seed file found at ${secretSeedPath}. Skipping secret seed.`);
        }

        // Seed Data (Fallback / Default)
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            console.log('Seeding initial data...');

            // Create Admin User
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
                ['admin', hashedPassword, 'admin']
            );
            console.log('Admin user created: admin / admin123');

            // Create Categories
            const categories = ['Bebidas', 'Snacks', 'Limpieza', 'Abarrotes'];
            for (const cat of categories) {
                await pool.query('INSERT INTO categories (name) VALUES ($1)', [cat]);
            }

            // Create Sample Products
            await pool.query(`
                INSERT INTO products (code, name, description, cost, price, stock, min_stock, category_id)
                VALUES 
                ('P001', 'Inka Cola 500ml', 'Gaseosa personal', 1.50, 2.50, 50, 10, 1),
                ('P002', 'Coca Cola 500ml', 'Gaseosa personal', 1.60, 2.50, 40, 10, 1),
                ('P003', 'Papas Lays', 'Papas fritas clásicas', 1.00, 1.50, 30, 5, 2),
                ('P004', 'Detergente Marsella', 'Bolsa 1kg', 8.00, 12.00, 20, 5, 3)
            `);
            console.log('Sample data seeded');
        } else {
            console.log('Users table is not empty. Skipping default data seeding.');
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = initDb;
