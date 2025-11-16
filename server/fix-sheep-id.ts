
import mysql from "mysql2/promise";

async function fixSheepTable() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    console.log("Checking sheep table structure...");
    
    // Check current table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY, EXTRA 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'sheep'
      AND COLUMN_NAME = 'id'
    `) as any;

    console.log("Current id column:", columns[0]);

    // Drop and recreate the id column with proper AUTO_INCREMENT
    console.log("Fixing id column...");
    
    await connection.execute(`ALTER TABLE sheep MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT`);
    
    console.log("✓ Fixed sheep table id column");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing sheep table:", error);
    process.exit(1);
  }
}

fixSheepTable();
