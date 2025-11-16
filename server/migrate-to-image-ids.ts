import mysql from "mysql2/promise";

async function migrateData() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required. Format: mysql://user:password@host/database");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    console.log("Checking if imageIds column exists...");
    const [columns] = await connection.execute("SHOW COLUMNS FROM sheep LIKE 'imageIds'") as any;
    
    if (columns.length === 0) {
      console.log("Adding imageIds column...");
      await connection.execute("ALTER TABLE sheep ADD COLUMN imageIds JSON");
      
      console.log("Migrating data from images to imageIds...");
      const [rows] = await connection.execute("SELECT id, images FROM sheep") as any;
      
      for (const row of rows) {
        try {
          const oldImages = JSON.parse(row.images);
          await connection.execute(
            "UPDATE sheep SET imageIds = ? WHERE id = ?",
            [JSON.stringify([]), row.id]
          );
        } catch (e) {
          await connection.execute(
            "UPDATE sheep SET imageIds = ? WHERE id = ?",
            [JSON.stringify([]), row.id]
          );
        }
      }
      
      console.log("✓ Migration completed successfully");
    } else {
      console.log("imageIds column already exists");
    }

    await connection.end();
  } catch (error) {
    console.error("Error migrating data:", error);
    process.exit(1);
  }
}

migrateData();
