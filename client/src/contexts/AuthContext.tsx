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

  const { data: adminData, status: adminStatus } = useQuery<{ email: string; role: string } | null>({
    queryKey: ['/api/admins/check', currentFirebaseUser?.email],
    enabled: !!currentFirebaseUser && currentFirebaseUser.email !== PRIMARY_ADMIN_EMAIL,
    retry: false,
    refetchInterval: false,
    queryFn: async ({ queryKey }) => {
      const [, email] = queryKey;
      if (!email) return null;
      
      const res = await fetch(`/api/admins/check?email=${encodeURIComponent(email as string)}`);
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to check admin status');
      }
      return res.json();
    },
  });

  const { data: userProfileData, status: profileStatus } = useQuery<User | null>({
    queryKey: ['/api/users', currentFirebaseUser?.uid],
    enabled: !!currentFirebaseUser,
    retry: false,
    refetchOnMount: true,
    queryFn: async ({ queryKey }) => {
      const [, uid] = queryKey;
      const res = await fetch(`/api/users/${uid as string}`);
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (!currentFirebaseUser) {
      return;
    }

    const isPrimary = currentFirebaseUser.email === PRIMARY_ADMIN_EMAIL;
    
    if (!isPrimary && adminStatus !== 'success') {
      return;
    }
    
    const isAdmin = isPrimary || !!adminData;
    
    if (profileStatus !== 'success') {
      return;
    }
    
    if (!isAdmin && !userProfileData) {
      return;
    }
    
    let finalUserType = userProfileData?.userType;
    if (isAdmin && !finalUserType) {
      finalUserType = 'admin';
    }
    
    const appUser: User = {
      uid: currentFirebaseUser.uid,
      email: currentFirebaseUser.email,
      displayName: currentFirebaseUser.displayName,
      photoURL: currentFirebaseUser.photoURL,
      userType: finalUserType,
      isAdmin,
      adminRole: isPrimary ? "primary" : (adminData?.role as "secondary" | undefined),
    };
    
    setUser(appUser);
    setLoading(false);
  }, [currentFirebaseUser, adminData, userProfileData, adminStatus, profileStatus]);

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
