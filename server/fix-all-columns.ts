import mysql from "mysql2/promise";

async function fixAllColumns() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    // Check and add columns to sheep table
    const [sheepColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'sheep'
    `) as any;

    const sheepColumnNames = sheepColumns.map((col: any) => col.COLUMN_NAME);
    console.log("Existing sheep columns:", sheepColumnNames);

    // Add missing columns to sheep table
    if (!sheepColumnNames.includes('discount_percentage')) {
      await connection.execute(`ALTER TABLE sheep ADD COLUMN discount_percentage DECIMAL(5, 2)`);
      console.log("✓ Added discount_percentage to sheep");
    }

    if (!sheepColumnNames.includes('image_ids')) {
      await connection.execute(`ALTER TABLE sheep ADD COLUMN image_ids JSON NOT NULL DEFAULT (JSON_ARRAY())`);
      console.log("✓ Added image_ids to sheep");
    }

    // Check and add columns to orders table  
    const [ordersColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
    `) as any;

    const ordersColumnNames = ordersColumns.map((col: any) => col.COLUMN_NAME);
    console.log("Existing orders columns:", ordersColumnNames);

    if (!ordersColumnNames.includes('user_id')) {
      await connection.execute(`ALTER TABLE orders ADD COLUMN user_id VARCHAR(128)`);
      console.log("✓ Added user_id to orders");
    }

    console.log("\n✓ All columns fixed successfully!");
    await connection.end();
  } catch (error) {
    console.error("Error fixing columns:", error);
    process.exit(1);
  }
}

fixAllColumns();
