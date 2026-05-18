import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Singleton app initialization
export const app = getApps().length === 0 ? initializeApp(isConfigValid ? firebaseConfig : {}) : getApps()[0];

// Singleton Firestore initialization to prevent HMR errors
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

// Cloudinary used for storage
// Simple, optimized root collections
export const COLLECTIONS = {
  LOTS: 'lots',
  WORKERS: 'workers',
  TRANSACTIONS: 'transactions',
  SETTLEMENTS: 'settlements',
};
