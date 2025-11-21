import mysql from "mysql2/promise";

async function renameColumns() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL.trim());

    console.log("Renaming columns to snake_case format...");

    // Rename sheep table columns
    await connection.execute(`ALTER TABLE sheep CHANGE healthStatus health_status TEXT NOT NULL`);
    console.log("✓ Renamed healthStatus to health_status");

    await connection.execute(`ALTER TABLE sheep CHANGE isFeatured is_featured BOOLEAN NOT NULL DEFAULT FALSE`);
    console.log("✓ Renamed isFeatured to is_featured");

    await connection.execute(`ALTER TABLE sheep CHANGE createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    console.log("✓ Renamed createdAt to created_at");

    await connection.execute(`ALTER TABLE sheep CHANGE updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    console.log("✓ Renamed updatedAt to updated_at");

    // Remove duplicate column if exists
    try {
      await connection.execute(`ALTER TABLE sheep DROP COLUMN discountPercentage`);
      console.log("✓ Removed duplicate discountPercentage column");
    } catch (e: any) {
      if (!e.message.includes("check that it exists")) {
        console.log("  (discountPercentage column doesn't exist - OK)");
      }
    }

    // Rename orders table columns
    await connection.execute(`ALTER TABLE orders CHANGE userId user_id VARCHAR(128)`);
    console.log("✓ Renamed userId to user_id");

    await connection.execute(`ALTER TABLE orders CHANGE userName user_name VARCHAR(255) NOT NULL`);
    console.log("✓ Renamed userName to user_name");

    await connection.execute(`ALTER TABLE orders CHANGE userPhone user_phone VARCHAR(20) NOT NULL`);
    console.log("✓ Renamed userPhone to user_phone");

    await connection.execute(`ALTER TABLE orders CHANGE wilayaCode wilaya_code VARCHAR(10) NOT NULL`);
    console.log("✓ Renamed wilayaCode to wilaya_code");

    await connection.execute(`ALTER TABLE orders CHANGE wilayaName wilaya_name VARCHAR(100) NOT NULL`);
    console.log("✓ Renamed wilayaName to wilaya_name");

    await connection.execute(`ALTER TABLE orders CHANGE communeId commune_id INT NOT NULL`);
    console.log("✓ Renamed communeId to commune_id");

    await connection.execute(`ALTER TABLE orders CHANGE communeName commune_name VARCHAR(100) NOT NULL`);
    console.log("✓ Renamed communeName to commune_name");

    await connection.execute(`ALTER TABLE orders CHANGE totalAmount total_amount DECIMAL(10, 2) NOT NULL`);
    console.log("✓ Renamed totalAmount to total_amount");

    await connection.execute(`ALTER TABLE orders CHANGE createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    console.log("✓ Renamed createdAt to created_at");

    await connection.execute(`ALTER TABLE orders CHANGE updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    console.log("✓ Renamed updatedAt to updated_at");

    console.log("\n✓ All columns renamed successfully!");
    await connection.end();
  } catch (error) {
    console.error("Error renaming columns:", error);
    process.exit(1);
  }
}

renameColumns();
