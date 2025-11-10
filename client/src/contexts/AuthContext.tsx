import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if user is admin
        const isPrimary = firebaseUser.email === PRIMARY_ADMIN_EMAIL;
        let isAdminUser = isPrimary;
        let adminRole: "primary" | "secondary" | undefined = isPrimary ? "primary" : undefined;

        if (!isPrimary) {
          // Check if user is a secondary admin
          try {
            const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
            if (adminDoc.exists()) {
              isAdminUser = true;
              adminRole = "secondary";
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }

        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: isAdminUser,
          adminRole: adminRole,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
    isPrimaryAdmin: user?.adminRole === "primary",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
