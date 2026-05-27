import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const formatEmail = (username) => {
  if (!username) return '';
  if (username.includes('@')) return username.trim();
  return `${username.trim().toLowerCase()}@amrut.com`;
};

const getUsers = () => {
  try {
    const users = localStorage.getItem('amrut_users');
    if (!users) {
      const defaultUsers = [
        {
          uid: 'demo-manager-id',
          username: 'admin',
          pin: '123456',
          displayName: 'Demo Manager'
        }
      ];
      localStorage.setItem('amrut_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return [];
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,

      login: async (username, pin) => {
        set({ isLoading: true, error: null });
        // Add artificial latency for premium native feels
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
          const email = formatEmail(username);
          const cleanUsername = username.trim().toLowerCase().split('@')[0];
          const formattedPin = pin.length < 6 ? pin.padEnd(6, '0') : pin;

          const users = getUsers();
          const foundUser = users.find(u => u.username === cleanUsername);

          if (!foundUser || foundUser.pin !== formattedPin) {
            throw new Error('Invalid Manager ID or Security PIN.');
          }

          const userData = { 
            uid: foundUser.uid, 
            email: email,
            displayName: foundUser.displayName || username
          };
          
          set({ user: userData, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
          const googleUser = { 
            uid: 'google-demo-user', 
            email: 'google.demo@amrut.com',
            displayName: 'Google Demo User'
          };
          
          const users = getUsers();
          if (!users.some(u => u.uid === googleUser.uid)) {
            users.push({
              uid: googleUser.uid,
              username: 'google.demo',
              pin: '000000',
              displayName: googleUser.displayName
            });
            localStorage.setItem('amrut_users', JSON.stringify(users));
          }

          set({ user: googleUser, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      register: async (username, pin, displayName = '') => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
          const cleanUsername = username.trim().toLowerCase().split('@')[0];
          if (!cleanUsername) {
            throw new Error('Invalid Manager ID format.');
          }
          if (pin.length < 6) {
            throw new Error('Security PIN is too weak (must be at least 6 digits).');
          }
          
          const users = getUsers();
          if (users.some(u => u.username === cleanUsername)) {
            throw new Error('This Manager ID is already registered.');
          }

          const newUid = `user-${Date.now()}`;
          const newUser = {
            uid: newUid,
            username: cleanUsername,
            pin: pin,
            displayName: displayName || username
          };

          users.push(newUser);
          localStorage.setItem('amrut_users', JSON.stringify(users));
          
          const userData = { 
            uid: newUid, 
            email: formatEmail(cleanUsername),
            displayName: displayName || username
          };
          
          set({ user: userData, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 400));
        set({ user: null, isLoading: false });
      },

      resetPassword: async (username) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
          const cleanUsername = username.trim().toLowerCase().split('@')[0];
          const users = getUsers();
          const exists = users.some(u => u.username === cleanUsername);
          if (!exists) {
            throw new Error('No manager found with this ID.');
          }
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      initializeAuth: () => {
        // Set loading to false using stored Zustand persist state
        const currentUser = get().user;
        set({ user: currentUser, isLoading: false });
        return () => {}; // dummy unsubscribe
      }
    }),
    {
      name: 'amrut-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
