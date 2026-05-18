import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  increment,
  limit
} from 'firebase/firestore';

const COLLECTIONS = {
  LOTS: 'lots',
  WORKERS: 'workers',
  TRANSACTIONS: 'transactions',
  SETTLEMENTS: 'settlements'
};

// --- CLOUDINARY CONFIG ---
const CLOUDINARY_CLOUD_NAME = 'dbuzshnuk';
const CLOUDINARY_UPLOAD_PRESET = 'amrut_fashion';

// --- UTILS ---
const getCurrentUserId = () => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser.uid);
      return;
    }
    
    // Fallback/timeout to prevent hanging if no user is authenticated
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Unauthorized access. User session expired."));
    }, 4000);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timeout);
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error("Unauthorized access. User session expired."));
      }
    });
  });
};

export const uploadImage = async (file, folder = 'misc') => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `amrut/${folder}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};

export const deleteImage = async (url) => {
  // Unsigned upload presets do not allow client-side deletion for security.
  return;
};

// --- LOTS ---

export const fetchLots = async () => {
  const uid = await getCurrentUserId();
  const lotsCol = collection(db, COLLECTIONS.LOTS);
  const q = query(lotsCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  const lots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort on client side to remain index-free
  return lots.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const addLot = async (lotData) => {
  const uid = await getCurrentUserId();
  const lotsCol = collection(db, COLLECTIONS.LOTS);
  
  const newLot = {
    ...lotData,
    userId: uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(lotsCol, newLot);
  return { id: docRef.id, ...newLot };
};

export const updateLot = async (id, updates) => {
  const lotRef = doc(db, COLLECTIONS.LOTS, id);
  const dataToUpdate = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(lotRef, dataToUpdate);
  return { id, ...dataToUpdate };
};

export const deleteLot = async (id) => {
  const lotRef = doc(db, COLLECTIONS.LOTS, id);
  await deleteDoc(lotRef);
};

// --- WORKERS ---

export const fetchWorkers = async () => {
  const uid = await getCurrentUserId();
  const workersCol = collection(db, COLLECTIONS.WORKERS);
  const q = query(workersCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addWorker = async (workerData) => {
  const uid = await getCurrentUserId();
  const workersCol = collection(db, COLLECTIONS.WORKERS);
  const newWorker = {
    ...workerData,
    userId: uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(workersCol, newWorker);
  return { id: docRef.id, ...newWorker };
};

export const updateWorker = async (id, updates) => {
  const workerRef = doc(db, COLLECTIONS.WORKERS, id);
  await updateDoc(workerRef, { ...updates, updatedAt: serverTimestamp() });
  return updates;
};

export const deleteWorker = async (id) => {
  const workerRef = doc(db, COLLECTIONS.WORKERS, id);
  await deleteDoc(workerRef);
};

// --- TRANSACTIONS ---

export const fetchTransactions = async (workerId = null) => {
  const uid = await getCurrentUserId();
  const txCol = collection(db, COLLECTIONS.TRANSACTIONS);
  const q = query(txCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  
  let txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (workerId) {
    txs = txs.filter(tx => tx.workerId === workerId);
  }
  
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addTransactionsBatch = async (transactionsArray) => {
  const uid = await getCurrentUserId();
  const batch = writeBatch(db);
  const txCol = collection(db, COLLECTIONS.TRANSACTIONS);
  
  const createdTxs = [];
  transactionsArray.forEach(txData => {
    const newDocRef = doc(txCol);
    const newTx = {
      ...txData,
      userId: uid,
      status: 'active',
      settlementId: null,
      createdAt: serverTimestamp()
    };
    batch.set(newDocRef, newTx);
    createdTxs.push({ id: newDocRef.id, ...newTx });
  });

  await batch.commit();
  return createdTxs;
};

export const addTransaction = async (txData) => {
  const [created] = await addTransactionsBatch([txData]);
  return created;
};

export const updateTransaction = async (id, updates) => {
  const txRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
  await updateDoc(txRef, updates);
};

export const deleteTransaction = async (id) => {
  const txRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
  await deleteDoc(txRef);
};

// --- SETTLEMENTS ---

export const fetchSettlements = async (workerId = null) => {
  const uid = await getCurrentUserId();
  const stCol = collection(db, COLLECTIONS.SETTLEMENTS);
  const q = query(stCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  
  let settlements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (workerId) {
    settlements = settlements.filter(s => s.workerId === workerId);
  }
  
  return settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const createSettlement = async (workerId, amountPaid, activeTransactions) => {
  const uid = await getCurrentUserId();
  const batch = writeBatch(db);
  const stCol = collection(db, COLLECTIONS.SETTLEMENTS);
  
  // Create settlement record
  const stDocRef = doc(stCol);
  const txIds = activeTransactions.map(tx => tx.id);
  
  const newSettlement = {
    userId: uid,
    workerId,
    amountPaid,
    txIds,
    date: new Date().toISOString(),
    createdAt: serverTimestamp()
  };
  
  batch.set(stDocRef, newSettlement);

  // Update all transactions to 'settled'
  activeTransactions.forEach(tx => {
    const txRef = doc(db, COLLECTIONS.TRANSACTIONS, tx.id);
    batch.update(txRef, { status: 'settled', settlementId: stDocRef.id });
  });

  await batch.commit();
  return { id: stDocRef.id, ...newSettlement };
};

// --- INVENTORY ---

export const fetchInventory = async () => {
  const uid = await getCurrentUserId();
  const invCol = collection(db, 'inventory');
  const q = query(invCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchInventoryLogs = async () => {
  const uid = await getCurrentUserId();
  const logCol = collection(db, 'inventory_logs');
  const q = query(logCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
};

export const addInventoryItem = async (itemData) => {
  const uid = await getCurrentUserId();
  const invCol = collection(db, 'inventory');
  const newItem = {
    ...itemData,
    userId: uid,
    quantity: Number(itemData.quantity),
    minThreshold: Number(itemData.minThreshold),
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(invCol, newItem);
  return { id: docRef.id, ...newItem };
};

export const updateInventoryStock = async (itemId, delta, reason, currentStock) => {
  const uid = await getCurrentUserId();
  const batch = writeBatch(db);
  const invRef = doc(db, 'inventory', itemId);
  const logCol = collection(db, 'inventory_logs');
  
  const newQty = Number(currentStock) + Number(delta);
  batch.update(invRef, { quantity: newQty, updatedAt: serverTimestamp() });
  
  const logRef = doc(logCol);
  batch.set(logRef, {
    userId: uid,
    itemId,
    delta: Number(delta),
    newQty,
    reason,
    timestamp: serverTimestamp()
  });
  
  await batch.commit();
};

export const deleteInventoryItem = async (id) => {
  await deleteDoc(doc(db, 'inventory', id));
};

// --- BACKUPS ---

export const createCloudBackup = async (fullData) => {
  const uid = await getCurrentUserId();
  const backupsCol = collection(db, 'backups');
  const newBackup = {
    userId: uid,
    data: fullData,
    timestamp: serverTimestamp(),
    type: 'snapshot'
  };
  const docRef = await addDoc(backupsCol, newBackup);
  return docRef.id;
};

export const fetchLatestBackup = async () => {
  const uid = await getCurrentUserId();
  const backupsCol = collection(db, 'backups');
  const q = query(backupsCol, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  const backups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (backups.length === 0) return null;
  backups.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  return backups[0];
};

export const migrateLegacyData = async () => {
  const uid = await getCurrentUserId();
  const batch = writeBatch(db);
  let migrationNeeded = false;

  const collectionsList = [
    COLLECTIONS.LOTS,
    COLLECTIONS.WORKERS,
    COLLECTIONS.TRANSACTIONS,
    COLLECTIONS.SETTLEMENTS,
    'inventory',
    'inventory_logs',
    'backups'
  ];

  for (const colName of collectionsList) {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.userId) {
        batch.update(docSnap.ref, { userId: uid });
        migrationNeeded = true;
      }
    });
  }

  if (migrationNeeded) {
    await batch.commit();
    console.log("Successfully migrated legacy data to user:", uid);
  }
};

export const checkHasLegacyData = async () => {
  try {
    const lotsCol = collection(db, COLLECTIONS.LOTS);
    const snapshot = await getDocs(lotsCol);
    return snapshot.docs.some(docSnap => {
      const data = docSnap.data();
      return !data.userId || data.userId === '';
    });
  } catch (err) {
    console.error("checkHasLegacyData error:", err);
    return false;
  }
};
