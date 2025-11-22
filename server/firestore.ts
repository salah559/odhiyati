import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let db: Firestore | null = null;

export function initializeFirestore(): Firestore {
  if (db) {
    return db;
  }

  try {
    // تحقق من المتغيرات المطلوبة
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY بيئي متغير مفقود. تأكد من إضافته إلى Vercel Environment Variables');
    }

    if (!getApps().length) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountKey);
      } catch (parseError) {
        throw new Error(`خطأ في تحليل FIREBASE_SERVICE_ACCOUNT_KEY JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      adminApp = getApps()[0];
    }

    db = getFirestore(adminApp);
    console.log('✅ تم تهيئة Firestore بنجاح');
    
    return db;
  } catch (error) {
    console.error('❌ فشل في تهيئة Firestore:', error);
    throw error;
  }
}

export function getDb(): Firestore {
  if (!db) {
    return initializeFirestore();
  }
  return db;
}
