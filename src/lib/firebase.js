import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace these with real credentials in .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Defensive check to avoid crashing if env vars are missing
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigValid) {
  console.error("Firebase configuration is missing. Check your .env.local file.");
}

export const app = initializeApp(isConfigValid ? firebaseConfig : {});
export const db = getFirestore(app);
// Cloudinary used for storage


// Simple, optimized root collections
export const COLLECTIONS = {
  LOTS: 'lots',
  WORKERS: 'workers',
  TRANSACTIONS: 'transactions',
  SETTLEMENTS: 'settlements',
};
