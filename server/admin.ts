import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Try default initialization (for local development with gcloud CLI)
      admin.initializeApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export const auth = admin.apps.length ? admin.auth() : null;
export const firestore = admin.apps.length ? admin.firestore() : null;

export async function getUserByEmail(email: string) {
  if (!auth) {
    throw new Error("Firebase Admin SDK is not configured. Please add GOOGLE_APPLICATION_CREDENTIALS_JSON to your secrets.");
  }

  try {
    const user = await auth.getUserByEmail(email);
    return { uid: user.uid, email: user.email };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}
