import { db } from './firebase';
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
  increment
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
  // We skip this for Cloudinary. Space is not an issue with 25GB free.
  return;
};

// --- LOTS ---

export const fetchLots = async () => {
  const lotsCol = collection(db, COLLECTIONS.LOTS);
  const snapshot = await getDocs(lotsCol);
  const lots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort on client side to avoid needing a Firestore Index
  return lots.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const addLot = async (lotData) => {
  const lotsCol = collection(db, COLLECTIONS.LOTS);
  
  const newLot = {
    ...lotData,
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
  const workersCol = collection(db, COLLECTIONS.WORKERS);
  const snapshot = await getDocs(workersCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addWorker = async (workerData) => {
  const workersCol = collection(db, COLLECTIONS.WORKERS);
  const newWorker = {
    ...workerData,
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

// --- TRANSACTIONS ---

export const fetchTransactions = async (workerId = null) => {
  const txCol = collection(db, COLLECTIONS.TRANSACTIONS);
  let q;
  if (workerId) {
    q = query(txCol, where('workerId', '==', workerId));
  } else {
    q = query(txCol); 
  }
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addTransactionsBatch = async (transactionsArray) => {
  const batch = writeBatch(db);
  const txCol = collection(db, COLLECTIONS.TRANSACTIONS);
  
  const createdTxs = [];
  transactionsArray.forEach(txData => {
    const newDocRef = doc(txCol);
    const newTx = {
      ...txData,
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
  const stCol = collection(db, COLLECTIONS.SETTLEMENTS);
  let q;
  if (workerId) {
    q = query(stCol, where('workerId', '==', workerId));
  } else {
    q = query(stCol);
  }
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const createSettlement = async (workerId, amountPaid, activeTransactions) => {
  const batch = writeBatch(db);
  const stCol = collection(db, COLLECTIONS.SETTLEMENTS);
  
  // Create settlement record
  const stDocRef = doc(stCol);
  const txIds = activeTransactions.map(tx => tx.id);
  
  const newSettlement = {
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
  const invCol = collection(db, 'inventory');
  const snapshot = await getDocs(invCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchInventoryLogs = async () => {
  const logCol = collection(db, 'inventory_logs');
  const q = query(logCol, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addInventoryItem = async (itemData) => {
  const invCol = collection(db, 'inventory');
  const newItem = {
    ...itemData,
    quantity: Number(itemData.quantity),
    minThreshold: Number(itemData.minThreshold),
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(invCol, newItem);
  return { id: docRef.id, ...newItem };
};

export const updateInventoryStock = async (itemId, delta, reason, currentStock) => {
  const batch = writeBatch(db);
  const invRef = doc(db, 'inventory', itemId);
  const logCol = collection(db, 'inventory_logs');
  
  const newQty = Number(currentStock) + Number(delta);
  batch.update(invRef, { quantity: newQty, updatedAt: serverTimestamp() });
  
  const logRef = doc(logCol);
  batch.set(logRef, {
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
