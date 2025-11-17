import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    console.log("🔍 اختبار الاتصال بقاعدة البيانات...\n");
    
    // اختبار الاتصال
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ الاتصال بقاعدة البيانات ناجح!");
    
    // الحصول على اسم قاعدة البيانات
    const dbInfo = await db.execute(sql`SELECT DATABASE() as current_db`);
    console.log(`📊 قاعدة البيانات الحالية: ${JSON.stringify(dbInfo[0], null, 2)}\n`);
    
    // قائمة الجداول الموجودة
    const tables = await db.execute(sql`SHOW TABLES`);
    console.log("📋 الجداول الموجودة في قاعدة البيانات:");
    console.log(JSON.stringify(tables, null, 2));
    
    // معلومات عن جدول images
    try {
      const imagesTableInfo = await db.execute(sql`DESCRIBE images`);
      console.log("\n📸 بنية جدول images:");
      console.log(JSON.stringify(imagesTableInfo, null, 2));
    } catch (e) {
      console.log("\n⚠️ جدول images غير موجود");
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:");
    console.error(error.message);
    console.error("\nتفاصيل الخطأ:", error);
    process.exit(1);
  }
}

testConnection();
