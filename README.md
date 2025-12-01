# Store System (POS & Inventory)

A complete web system for a store using React (Frontend) and Express (Backend).

## Features
- **Inventory Management**: CRUD for products and categories.
- **Point of Sale (POS)**: Cart system, stock management, sales recording.
- **Reports**: Sales history.
- **Authentication**: JWT based login with roles (Admin/Seller).

## Prerequisites
- Node.js
- PostgreSQL

## Setup

### 1. Database
Ensure PostgreSQL is running. Create a database named `store_db` (or update `.env`).
Run the initialization script:
```bash
cd server
npm run db:init
```
*Note: If this fails, ensure your Postgres credentials in `server/.env` are correct.*

### 2. Backend
```bash
cd server
npm install
npm run dev
```
Server runs on `http://localhost:3000`.

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## Default Login
- **Username**: admin
- **Password**: admin123

## Architecture
- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router.
- **Backend**: Express, Node.js, PostgreSQL, JWT.
