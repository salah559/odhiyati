import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let db: Firestore;

export function initializeFirestore(): Firestore {
  if (db) {
    return db;
  }

  try {
    if (!getApps().length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      adminApp = getApps()[0];
    }

    db = getFirestore(adminApp);
    
    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    });
    throw error;
  }
}

export function getDb(): Firestore {
  if (!db) {
    return initializeFirestore();
  }
  return db;
}
