import mysql from "mysql2/promise";

async function addDiscountColumn() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    try {
      await connection.execute(`
        ALTER TABLE sheep ADD COLUMN discount_percentage DECIMAL(5, 2) AFTER price
      `);
      console.log("✓ Added discount_percentage column successfully");
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("✓ discount_percentage column already exists");
      } else {
        throw error;
      }
    }

    await connection.end();
  } catch (error) {
    console.error("Error adding column:", error);
    process.exit(1);
  }
}

addDiscountColumn();
