import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthChange, db } from "@/lib/firebase";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isPrimaryAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

const PRIMARY_ADMIN_EMAIL = "bouazzasalah120120@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser: FirebaseUser | null) => {
      setCurrentFirebaseUser(firebaseUser);
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to admin collection changes in real-time
  useEffect(() => {
    if (!currentFirebaseUser) {
      return;
    }

    const updateUserAdminStatus = (isAdminUser: boolean, adminRole: "primary" | "secondary" | undefined) => {
      const appUser: User = {
        uid: currentFirebaseUser.uid,
        email: currentFirebaseUser.email,
        displayName: currentFirebaseUser.displayName,
        photoURL: currentFirebaseUser.photoURL,
        isAdmin: isAdminUser,
        adminRole: adminRole,
      };
      setUser(appUser);
      setLoading(false);
    };

    const isPrimary = currentFirebaseUser.email === PRIMARY_ADMIN_EMAIL;
    
    if (isPrimary) {
      updateUserAdminStatus(true, "primary");
      return;
    }

    // For non-primary users, listen to admins collection in real-time
    const adminDocRef = collection(db, "admins");
    const q = query(adminDocRef, where("email", "==", currentFirebaseUser.email));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const isAdminUser = !snapshot.empty;
        const adminRole: "primary" | "secondary" | undefined = isAdminUser ? "secondary" : undefined;
        updateUserAdminStatus(isAdminUser, adminRole);
      },
      (error) => {
        console.error("Error listening to admin status:", error);
        updateUserAdminStatus(false, undefined);
      }
    );

    return () => unsubscribe();
  }, [currentFirebaseUser]);

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
    isPrimaryAdmin: user?.adminRole === "primary",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
