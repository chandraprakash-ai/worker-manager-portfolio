import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const formatEmail = (username) => {
  if (!username) return '';
  if (username.includes('@')) return username.trim();
  return `${username.trim().toLowerCase()}@amrut.com`;
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      login: async (username, pin) => {
        set({ isLoading: true, error: null });
        try {
          const email = formatEmail(username);
          const formattedPin = pin.length < 6 ? pin.padEnd(6, '0') : pin;
          
          const userCredential = await signInWithEmailAndPassword(auth, email, formattedPin);
          const firebaseUser = userCredential.user;
          
          const userData = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || username
          };
          
          set({ user: userData, isLoading: false });
          return true;
        } catch (error) {
          let readableError = error.message;
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            readableError = 'Invalid Manager ID or Security PIN.';
          } else if (error.code === 'auth/invalid-email') {
            readableError = 'Invalid Manager ID format.';
          }
          set({ error: readableError, isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const firebaseUser = userCredential.user;
          
          const userData = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
          };
          
          set({ user: userData, isLoading: false });
          return true;
        } catch (error) {
          let readableError = error.message;
          if (error.code === 'auth/popup-closed-by-user') {
            readableError = 'Sign in was cancelled.';
          } else if (error.code === 'auth/operation-not-allowed') {
            readableError = 'Google Sign In is not enabled in your Firebase Console.';
          }
          set({ error: readableError, isLoading: false });
          return false;
        }
      },

      register: async (username, pin, displayName = '') => {
        set({ isLoading: true, error: null });
        try {
          const email = formatEmail(username);
          // Firebase password must be >= 6 chars
          const formattedPin = pin.length < 6 ? pin.padEnd(6, '0') : pin;
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, formattedPin);
          const firebaseUser = userCredential.user;
          
          if (displayName) {
            await updateProfile(firebaseUser, { displayName });
          }
          
          const userData = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            displayName: displayName || username
          };
          
          set({ user: userData, isLoading: false });
          return true;
        } catch (error) {
          let readableError = error.message;
          if (error.code === 'auth/email-already-in-use') {
            readableError = 'This Manager ID is already registered.';
          } else if (error.code === 'auth/weak-password') {
            readableError = 'Security PIN is too weak (must be at least 6 digits).';
          } else if (error.code === 'auth/invalid-email') {
            readableError = 'Invalid Manager ID format.';
          }
          set({ error: readableError, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ user: null, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      resetPassword: async (username) => {
        set({ isLoading: true, error: null });
        try {
          const email = formatEmail(username);
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
          return true;
        } catch (error) {
          let readableError = error.message;
          if (error.code === 'auth/user-not-found') {
            readableError = 'No manager found with this ID.';
          }
          set({ error: readableError, isLoading: false });
          return false;
        }
      },

      initializeAuth: () => {
        return onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const userData = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
            };
            set({ user: userData, isLoading: false });
          } else {
            set({ user: null, isLoading: false });
          }
        });
      }
    }),
    {
      name: 'amrut-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
