import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (username, pin) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we'd query Firestore for the user and compare hashes
          // For this blueprint, we assume the manager exists or we check a specific doc
          // Simulating auth for now:
          if (username === 'admin' && pin === '1234') {
            const userData = { id: 'manager_01', username: 'admin' };
            set({ user: userData, isLoading: false });
            return true;
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: () => set({ user: null }),
    }),
    {
      name: 'amrut-auth',
    }
  )
);
