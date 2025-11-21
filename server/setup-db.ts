import mysql from "mysql2/promise";

async function setupDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required. Format: mysql://user:password@host/database");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_data MEDIUMTEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sheep (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount_percentage DECIMAL(5, 2),
        image_ids JSON NOT NULL,
        age VARCHAR(100) NOT NULL,
        weight VARCHAR(100) NOT NULL,
        breed VARCHAR(100) NOT NULL,
        health_status TEXT NOT NULL,
        description TEXT NOT NULL,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128),
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        wilaya_code VARCHAR(10) NOT NULL,
        wilaya_name VARCHAR(100) NOT NULL,
        commune_id INT NOT NULL,
        commune_name VARCHAR(100) NOT NULL,
        items JSON NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'secondary',
        added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sheep_id INT NOT NULL,
        percentage DECIMAL(5, 2) NOT NULL,
        valid_from TIMESTAMP NOT NULL,
        valid_to TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✓ Database tables created successfully");
    await connection.end();
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();
