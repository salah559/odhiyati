import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase";
import type { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isPrimaryAdmin: false,
  isSeller: false,
  isBuyer: false,
});

export const useAuth = () => useContext(AuthContext);

const PRIMARY_ADMIN_EMAIL = "bouazzasalah120120@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState<FirebaseUser | null>(null);

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

  const { data: adminData } = useQuery<{ email: string; role: string } | null>({
    queryKey: ['/api/admins/check', currentFirebaseUser?.email],
    enabled: !!currentFirebaseUser && currentFirebaseUser.email !== PRIMARY_ADMIN_EMAIL,
    refetchInterval: 5000,
  });

  const { data: userProfileData } = useQuery<User | null>({
    queryKey: ['/api/users', currentFirebaseUser?.uid],
    enabled: !!currentFirebaseUser,
    retry: false,
  });

  useEffect(() => {
    if (!currentFirebaseUser) {
      return;
    }

    const isPrimary = currentFirebaseUser.email === PRIMARY_ADMIN_EMAIL;
    
    const appUser: User = {
      uid: currentFirebaseUser.uid,
      email: currentFirebaseUser.email,
      displayName: currentFirebaseUser.displayName,
      photoURL: currentFirebaseUser.photoURL,
      userType: userProfileData?.userType,
      isAdmin: isPrimary || !!adminData,
      adminRole: isPrimary ? "primary" : (adminData?.role as "secondary" | undefined),
    };
    
    setUser(appUser);
    setLoading(false);
  }, [currentFirebaseUser, adminData, userProfileData]);

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
    isPrimaryAdmin: user?.adminRole === "primary",
    isSeller: user?.userType === "seller",
    isBuyer: user?.userType === "buyer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
