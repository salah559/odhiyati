import mysql from "mysql2/promise";

async function migrateData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST?.trim(),
      user: process.env.DB_USER?.trim(),
      password: process.env.DB_PASS?.trim(),
      database: process.env.DB_NAME?.trim(),
    });

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
