// Firebase configuration and initialization
// Reference: firebase_barebones_javascript blueprint
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/config/firebase.config";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw new Error(error.message || "فشل تسجيل الدخول بواسطة Google");
  }
};

// Email Sign In - creates anonymous account for email-only users
export const signInWithEmail = async (email: string) => {
  try {
    // Create an anonymous account - the email will be stored in the user profile
    const result = await signInAnonymously(auth);
    
    // Return user object with email set (we'll save it in the profile)
    return {
      ...result.user,
      email: email,
      displayName: email.split('@')[0]
    };
  } catch (error: any) {
    console.error("Error signing in with email:", error);
    throw new Error(error.message || "فشل تسجيل الدخول بالبريد الإلكتروني");
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(error.message || "فشل تسجيل الخروج");
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};