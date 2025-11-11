import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // In development, use application default credentials or emulator
  admin.initializeApp();
}

export const auth = admin.auth();
export const firestore = admin.firestore();

export async function getUserByEmail(email: string) {
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
