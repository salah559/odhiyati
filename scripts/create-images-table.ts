import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createImagesTable() {
  try {
    console.log("Creating images table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS images (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        delete_url TEXT,
        original_file_name VARCHAR(255),
        mime_type VARCHAR(100) NOT NULL,
        file_size INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log("✅ Images table created successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating images table:", error.message);
    process.exit(1);
  }
}

createImagesTable();
