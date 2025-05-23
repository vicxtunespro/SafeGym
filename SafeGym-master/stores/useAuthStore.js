import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoggedIn: false,
      newUser: true,

      setUser: (user, role) => set({ user, isLoggedIn: true, role }),
      clearAuth: () => set({
        user: null,
        role: null,
        isLoggedIn: false,
        newUser: false
      }),
      setRole: (role) => set({ role }),
      finishOnBoard: () => set({ newUser: false})
    }),
    {
      name: 'auth-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
