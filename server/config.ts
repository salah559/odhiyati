
// ملف التكوين الرئيسي للمتغيرات البيئية
export const config = {
  // إعدادات الخادم
  port: parseInt(process.env.PORT || '5000', 10),
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // إعدادات Firebase (يجب تحديث هذه القيم بقيمك الفعلية)
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  },
  
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
