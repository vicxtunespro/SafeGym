import { auth } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const { user, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', { 
        hasUser: !!firebaseUser,
        userId: firebaseUser?.uid 
      });

      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDoc = await firebaseUser.getIdTokenResult();
          const role = userDoc.claims.role || 'user';
          console.log('[AuthContext] Setting user with role:', role);
          setUser(firebaseUser, role);
        } catch (error) {
          console.error('[AuthContext] Error getting user role:', error);
          setUser(firebaseUser, 'user'); // Default to user role if error
        }
      } else {
        console.log('[AuthContext] No user, clearing auth');
        clearAuth();
      }
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 