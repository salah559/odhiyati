import mysql from "mysql2/promise";

async function migrateImagesColumn() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'sheep'
      AND COLUMN_NAME IN ('images', 'image_ids')
    `) as any;

    const hasImages = columns.some((col: any) => col.COLUMN_NAME === 'images');
    const hasImageIds = columns.some((col: any) => col.COLUMN_NAME === 'image_ids');

    console.log(`Current state: has 'images'=${hasImages}, has 'image_ids'=${hasImageIds}`);

    if (hasImages && !hasImageIds) {
      console.log("Renaming 'images' column to 'image_ids'...");
      await connection.execute(`
        ALTER TABLE sheep CHANGE images image_ids JSON NOT NULL
      `);
      console.log("✓ Column renamed successfully");
    } else if (!hasImages && !hasImageIds) {
      console.log("Adding 'image_ids' column...");
      await connection.execute(`
        ALTER TABLE sheep ADD COLUMN image_ids JSON NOT NULL DEFAULT (JSON_ARRAY())
      `);
      console.log("✓ Column added successfully");
    } else {
      console.log("✓ Table already has correct schema");
    }

    await connection.end();
  } catch (error) {
    console.error("Error migrating column:", error);
    process.exit(1);
  }
}

migrateImagesColumn();
