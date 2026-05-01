import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Note: Replace these with real credentials from Firebase Console
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "amrut-fashion.firebaseapp.com",
  projectId: "amrut-fashion",
  storageBucket: "amrut-fashion.appspot.com",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Application ID used for Firestore paths as per Blueprint
export const APP_ID = 'amrut-fashion-v1';

export const COLLECTIONS = {
  MANAGERS: (managerId) => `artifacts/${APP_ID}/users/${managerId}/profile`,
  WORKERS: `artifacts/${APP_ID}/public/data/workers`,
  TRANSACTIONS: `artifacts/${APP_ID}/public/data/transactions`,
  SETTLEMENTS: `artifacts/${APP_ID}/public/data/settlements`,
};
