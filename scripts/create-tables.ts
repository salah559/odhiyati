import mysql from "mysql2/promise";

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log("Connected to MySQL database!");

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'secondary',
        added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'admins' created");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sheep (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount_percentage DECIMAL(5, 2),
        images JSON NOT NULL,
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
    console.log("✅ Table 'sheep' created");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
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
    console.log("✅ Table 'orders' created");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS discounts (
        id VARCHAR(36) PRIMARY KEY,
        sheep_id VARCHAR(36) NOT NULL,
        percentage DECIMAL(5, 2) NOT NULL,
        valid_from TIMESTAMP NOT NULL,
        valid_to TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'discounts' created");

    // Insert primary admin
    await connection.query(`
      INSERT IGNORE INTO admins (id, email, role)
      VALUES (UUID(), 'bouazzasalah120120@gmail.com', 'primary')
    `);
    console.log("✅ Primary admin added");

    console.log("\n✨ All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

createTables();
