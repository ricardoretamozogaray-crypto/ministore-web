-- Database Schema for Store System

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'seller', -- 'admin', 'seller'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) NOT NULL,           -- nuevo campo: costo del producto
    price DECIMAL(10, 2) NOT NULL,
    stock DECIMAL(10, 3) NOT NULL DEFAULT 0, -- Changed to DECIMAL for weight support
    min_stock DECIMAL(10, 3) NOT NULL DEFAULT 0, -- Changed to DECIMAL
    unit_type VARCHAR(10) NOT NULL DEFAULT 'unit', -- 'unit' or 'kg'
    category_id INTEGER REFERENCES categories(id),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'card', 'yape', 'plin'
    status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10, 3) NOT NULL, -- Changed to DECIMAL
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' -- 'active', 'cancelled'
);

CREATE TABLE IF NOT EXISTS sale_logs (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    sale_item_id INTEGER REFERENCES sale_items(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'CANCEL_SALE', 'CANCEL_ITEM', 'RESTORE_SALE', 'RESTORE_ITEM'
    quantity DECIMAL(10, 3),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
