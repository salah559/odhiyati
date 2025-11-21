
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/config/firebase.config';
import { useQuery } from '@tanstack/react-query';
import type { User, UserType } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [guestUser, setGuestUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check for guest user in localStorage
  useEffect(() => {
    const storedGuest = localStorage.getItem('guestUser');
    if (storedGuest) {
      try {
        setGuestUser(JSON.parse(storedGuest));
      } catch (e) {
        console.error('Error parsing guest user:', e);
        localStorage.removeItem('guestUser');
      }
    }
  }, []);

  // Listen to Firebase auth changes
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (!user) {
        setGuestUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile from database if Firebase user exists
  const { data: dbUser, isLoading: dbLoading } = useQuery<User>({
    queryKey: ['/api/users', firebaseUser?.uid],
    enabled: !!firebaseUser?.uid,
    retry: 1,
  });

  const user = guestUser || dbUser || null;
  const loading = authLoading || (!!firebaseUser && dbLoading);
  const isAdmin = user?.userType === 'admin';
  const isGuest = user?.userType === 'guest';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
