
// ملف التكوين الرئيسي للمتغيرات البيئية
export const config = {
  // إعدادات الخادم
  port: parseInt(process.env.PORT || '5000', 10),
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // إعدادات Firestore (يتم تحميلها من environment variables فقط)
  firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  imgbbApiKey: process.env.IMGBB_API_KEY,
  
  // إعدادات قاعدة البيانات
  database: {
    url: process.env.DATABASE_URL || "",
  },
  
  // إعدادات الجلسة
  session: {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  },
  
  // معلومات Replit
  replit: {
    slug: process.env.REPL_SLUG || "",
    owner: process.env.REPL_OWNER || "",
    devDomain: process.env.REPLIT_DEV_DOMAIN || "",
  },
  
  // البريد الإلكتروني للمدير الرئيسي
  superAdmin: {
    email: "bouazzasalah120120@gmail.com",
  },
} as const;

export type Config = typeof config;
