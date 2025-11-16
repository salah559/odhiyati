import mysql from "mysql2/promise";

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST?.trim(),
      user: process.env.DB_USER?.trim(),
      password: process.env.DB_PASS?.trim(),
      database: process.env.DB_NAME?.trim(),
    });

    const [columns] = await connection.execute("SHOW COLUMNS FROM sheep");
    console.log("Current sheep table structure:");
    console.log(columns);

    await connection.execute("DROP TABLE IF EXISTS sheep");
    await connection.execute(`
      CREATE TABLE sheep (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discountPercentage DECIMAL(5, 2),
        imageIds JSON NOT NULL,
        age VARCHAR(100) NOT NULL,
        weight VARCHAR(100) NOT NULL,
        breed VARCHAR(100) NOT NULL,
        healthStatus TEXT NOT NULL,
        description TEXT NOT NULL,
        isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✓ Sheep table recreated successfully");
    await connection.end();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkDatabase();
