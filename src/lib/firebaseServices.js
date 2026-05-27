// --- CLOUDINARY CONFIG ---
const CLOUDINARY_CLOUD_NAME = 'dbuzshnuk';
const CLOUDINARY_UPLOAD_PRESET = 'amrut_fashion';

// --- UTILS & CORE DATABASE LAYER ---
const getCurrentUserId = () => {
  try {
    const authDataRaw = localStorage.getItem('amrut-auth');
    if (authDataRaw) {
      const authData = JSON.parse(authDataRaw);
      if (authData?.state?.user?.uid) {
        return authData.state.user.uid;
      }
    }
  } catch (e) {
    console.error("Error reading auth state", e);
  }
  return "demo-manager-id"; // Fallback demo user id
};

const getTable = (tableName) => {
  try {
    return JSON.parse(localStorage.getItem(`amrut_${tableName}`) || '[]');
  } catch (e) {
    console.error(`Error reading table ${tableName}`, e);
    return [];
  }
};

const saveTable = (tableName, data) => {
  try {
    localStorage.setItem(`amrut_${tableName}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving table ${tableName}`, e);
  }
};

// --- DATA SEEDER ---
const seedDefaultData = (uid) => {
  if (localStorage.getItem('amrut_seeded')) return;

  const daysAgo = (num) => {
    const d = new Date();
    d.setDate(d.getDate() - num);
    return d;
  };

  const defaultWorkers = [
    {
      id: 'worker-1',
      userId: uid,
      name: 'Ramesh Kumar',
      phone: '9876543210',
      address: 'Sanganer, Jaipur',
      status: 'active',
      createdAt: daysAgo(10).toISOString(),
      updatedAt: daysAgo(10).toISOString()
    },
    {
      id: 'worker-2',
      userId: uid,
      name: 'Sunita Devi',
      phone: '9812345678',
      address: 'Pratap Nagar, Jaipur',
      status: 'active',
      createdAt: daysAgo(8).toISOString(),
      updatedAt: daysAgo(8).toISOString()
    },
    {
      id: 'worker-3',
      userId: uid,
      name: 'Amit Sharma',
      phone: '9988776655',
      address: 'Mansarovar, Jaipur',
      status: 'active',
      createdAt: daysAgo(5).toISOString(),
      updatedAt: daysAgo(5).toISOString()
    }
  ];

  const defaultLots = [
    {
      id: 'lot-1',
      userId: uid,
      lotNumber: '1001',
      brand: 'KS4U',
      sizes: { 'M': 120, 'L': 150, 'XL': 100 },
      status: 'active',
      createdAt: { seconds: Math.floor(daysAgo(4).getTime() / 1000) },
      updatedAt: { seconds: Math.floor(daysAgo(4).getTime() / 1000) },
      stages: ['screening', 'cutting', 'stitching', 'steampress', 'finishing'],
      processes: [
        { id: 'screening', name: 'Screening', isDone: true, pieces: 370, notes: 'Completed smoothly' },
        { id: 'cutting', name: 'Cutting', isDone: true, pieces: 370, notes: '' },
        { id: 'stitching', name: 'Stitching', isDone: false, pieces: 200, notes: 'Ramesh is working on this' },
        { id: 'steampress', name: 'Steam Press', isDone: false, pieces: 0, notes: '' },
        { id: 'finishing', name: 'Finishing', isDone: false, pieces: 0, notes: '' }
      ],
      numColors: 2,
      avg: '3.7',
      rate: '15'
    },
    {
      id: 'lot-2',
      userId: uid,
      lotNumber: '1002',
      brand: 'Amrut',
      sizes: { 'S': 80, 'M': 100, 'L': 100 },
      status: 'active',
      createdAt: { seconds: Math.floor(daysAgo(2).getTime() / 1000) },
      updatedAt: { seconds: Math.floor(daysAgo(2).getTime() / 1000) },
      stages: ['screening', 'cutting', 'stitching'],
      processes: [
        { id: 'screening', name: 'Screening', isDone: true, pieces: 280, notes: 'Done' },
        { id: 'cutting', name: 'Cutting', isDone: false, pieces: 150, notes: '' },
        { id: 'stitching', name: 'Stitching', isDone: false, pieces: 0, notes: '' }
      ],
      numColors: 1,
      avg: '2.8',
      rate: '18'
    }
  ];

  const defaultTransactions = [
    {
      id: 'tx-1',
      userId: uid,
      workerId: 'worker-1',
      type: 'work',
      pieces: 100,
      rate: 15,
      amount: 1500,
      date: daysAgo(3).toISOString().split('T')[0],
      status: 'active',
      settlementId: null,
      createdAt: daysAgo(3).toISOString()
    },
    {
      id: 'tx-2',
      userId: uid,
      workerId: 'worker-1',
      type: 'advance',
      amount: 500,
      date: daysAgo(2).toISOString().split('T')[0],
      status: 'active',
      settlementId: null,
      createdAt: daysAgo(2).toISOString()
    },
    {
      id: 'tx-3',
      userId: uid,
      workerId: 'worker-2',
      type: 'work',
      pieces: 150,
      rate: 20,
      amount: 3000,
      date: daysAgo(1).toISOString().split('T')[0],
      status: 'active',
      settlementId: null,
      createdAt: daysAgo(1).toISOString()
    }
  ];

  const defaultInventory = [
    {
      id: 'inv-1',
      userId: uid,
      name: 'Cotton Fabric',
      category: 'Fabric',
      quantity: 350,
      unit: 'Meters',
      minThreshold: 50,
      createdAt: daysAgo(5).toISOString()
    },
    {
      id: 'inv-2',
      userId: uid,
      name: 'Black Thread Spool',
      category: 'Thread',
      quantity: 25,
      unit: 'Spools',
      minThreshold: 10,
      createdAt: daysAgo(5).toISOString()
    },
    {
      id: 'inv-3',
      userId: uid,
      name: 'Metal Buttons',
      category: 'Buttons',
      quantity: 1200,
      unit: 'Pcs',
      minThreshold: 200,
      createdAt: daysAgo(5).toISOString()
    }
  ];

  const defaultInventoryLogs = [
    {
      id: 'inv-log-1',
      userId: uid,
      itemId: 'inv-1',
      delta: 100,
      newQty: 350,
      reason: 'Initial purchase from supplier',
      timestamp: { seconds: Math.floor(daysAgo(5).getTime() / 1000) }
    }
  ];

  saveTable('workers', defaultWorkers);
  saveTable('lots', defaultLots);
  saveTable('transactions', defaultTransactions);
  saveTable('settlements', []);
  saveTable('inventory', defaultInventory);
  saveTable('inventory_logs', defaultInventoryLogs);
  saveTable('backups', []);
  
  localStorage.setItem('amrut_seeded', 'true');
};

// --- MEDIA ---
export const uploadImage = async (file, folder = 'misc') => {
  if (!file) return null;
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `amrut/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    if (response.ok) {
      const data = await response.json();
      return data.secure_url;
    }
  } catch (err) {
    console.warn("Cloudinary upload failed, falling back to local base64 preview.", err);
  }

  // Fallback to base64 Data URL for standalone offline-first demo
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

export const deleteImage = async (url) => {
  return;
};

// --- LOTS ---
export const fetchLots = async () => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  const lots = getTable('lots').filter(lot => lot.userId === uid);
  return lots.sort((a, b) => {
    const aSec = a.createdAt?.seconds || 0;
    const bSec = b.createdAt?.seconds || 0;
    return bSec - aSec;
  });
};

export const addLot = async (lotData) => {
  const uid = await getCurrentUserId();
  const lots = getTable('lots');
  const id = `lot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newLot = {
    ...lotData,
    id,
    userId: uid,
    status: 'active',
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) },
  };

  lots.push(newLot);
  saveTable('lots', lots);
  return newLot;
};

export const updateLot = async (id, updates) => {
  const lots = getTable('lots');
  const index = lots.findIndex(l => l.id === id);
  if (index === -1) throw new Error("Lot not found");
  
  const updatedLot = {
    ...lots[index],
    ...updates,
    updatedAt: { seconds: Math.floor(Date.now() / 1000) }
  };
  lots[index] = updatedLot;
  saveTable('lots', lots);
  return updatedLot;
};

export const deleteLot = async (id) => {
  const lots = getTable('lots');
  const filtered = lots.filter(l => l.id !== id);
  saveTable('lots', filtered);
};

// --- WORKERS ---
export const fetchWorkers = async () => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  return getTable('workers').filter(w => w.userId === uid);
};

export const addWorker = async (workerData) => {
  const uid = await getCurrentUserId();
  const workers = getTable('workers');
  const id = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newWorker = {
    ...workerData,
    id,
    userId: uid,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  workers.push(newWorker);
  saveTable('workers', workers);
  return newWorker;
};

export const updateWorker = async (id, updates) => {
  const workers = getTable('workers');
  const index = workers.findIndex(w => w.id === id);
  if (index === -1) throw new Error("Worker not found");
  
  const updatedWorker = {
    ...workers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  workers[index] = updatedWorker;
  saveTable('workers', workers);
  return updatedWorker;
};

export const deleteWorker = async (id) => {
  const workers = getTable('workers');
  const filtered = workers.filter(w => w.id !== id);
  saveTable('workers', filtered);
};

// --- TRANSACTIONS ---
export const fetchTransactions = async (workerId = null) => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  let txs = getTable('transactions').filter(tx => tx.userId === uid);
  if (workerId) {
    txs = txs.filter(tx => tx.workerId === workerId);
  }
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addTransactionsBatch = async (transactionsArray) => {
  const uid = await getCurrentUserId();
  const txs = getTable('transactions');
  const createdTxs = [];
  
  transactionsArray.forEach(txData => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTx = {
      ...txData,
      id,
      userId: uid,
      status: 'active',
      settlementId: null,
      createdAt: new Date().toISOString()
    };
    txs.push(newTx);
    createdTxs.push(newTx);
  });

  saveTable('transactions', txs);
  return createdTxs;
};

export const addTransaction = async (txData) => {
  const [created] = await addTransactionsBatch([txData]);
  return created;
};

export const updateTransaction = async (id, updates) => {
  const txs = getTable('transactions');
  const index = txs.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transaction not found");
  
  txs[index] = {
    ...txs[index],
    ...updates
  };
  saveTable('transactions', txs);
};

export const deleteTransaction = async (id) => {
  const txs = getTable('transactions');
  const filtered = txs.filter(t => t.id !== id);
  saveTable('transactions', filtered);
};

// --- SETTLEMENTS ---
export const fetchSettlements = async (workerId = null) => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  let settlements = getTable('settlements').filter(s => s.userId === uid);
  if (workerId) {
    settlements = settlements.filter(s => s.workerId === workerId);
  }
  return settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const createSettlement = async (workerId, amountPaid, activeTransactions) => {
  const uid = await getCurrentUserId();
  const settlements = getTable('settlements');
  const txs = getTable('transactions');
  
  const id = `settlement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const txIds = activeTransactions.map(tx => tx.id);
  
  const newSettlement = {
    id,
    userId: uid,
    workerId,
    amountPaid,
    txIds,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  settlements.push(newSettlement);
  saveTable('settlements', settlements);

  // Update all selected transactions to 'settled'
  const updatedTxs = txs.map(tx => {
    if (txIds.includes(tx.id)) {
      return { ...tx, status: 'settled', settlementId: id };
    }
    return tx;
  });
  saveTable('transactions', updatedTxs);

  return newSettlement;
};

// --- INVENTORY ---
export const fetchInventory = async () => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  return getTable('inventory').filter(i => i.userId === uid);
};

export const fetchInventoryLogs = async () => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  const logs = getTable('inventory_logs').filter(l => l.userId === uid);
  return logs.sort((a, b) => {
    const aSec = a.timestamp?.seconds || 0;
    const bSec = b.timestamp?.seconds || 0;
    return bSec - aSec;
  });
};

export const addInventoryItem = async (itemData) => {
  const uid = await getCurrentUserId();
  const inv = getTable('inventory');
  const id = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem = {
    ...itemData,
    id,
    userId: uid,
    quantity: Number(itemData.quantity),
    minThreshold: Number(itemData.minThreshold),
    createdAt: new Date().toISOString()
  };
  inv.push(newItem);
  saveTable('inventory', inv);
  return newItem;
};

export const updateInventoryStock = async (itemId, delta, reason, currentStock) => {
  const uid = await getCurrentUserId();
  const inv = getTable('inventory');
  const logs = getTable('inventory_logs');
  
  const index = inv.findIndex(i => i.id === itemId);
  if (index === -1) throw new Error("Inventory item not found");
  
  const newQty = Number(currentStock) + Number(delta);
  inv[index] = {
    ...inv[index],
    quantity: newQty,
    updatedAt: new Date().toISOString()
  };
  
  const logId = `inv-log-${Date.now()}`;
  const newLog = {
    id: logId,
    userId: uid,
    itemId,
    delta: Number(delta),
    newQty,
    reason,
    timestamp: { seconds: Math.floor(Date.now() / 1000) }
  };
  logs.push(newLog);
  
  saveTable('inventory', inv);
  saveTable('inventory_logs', logs);
};

export const deleteInventoryItem = async (id) => {
  const inv = getTable('inventory');
  const filtered = inv.filter(i => i.id !== id);
  saveTable('inventory', filtered);
};

// --- BACKUPS ---
export const createCloudBackup = async (fullData) => {
  const uid = await getCurrentUserId();
  const backups = getTable('backups');
  const id = `backup-${Date.now()}`;
  
  const newBackup = {
    id,
    userId: uid,
    data: fullData,
    timestamp: { seconds: Math.floor(Date.now() / 1000) },
    type: 'snapshot'
  };
  backups.push(newBackup);
  saveTable('backups', backups);
  return id;
};

export const fetchLatestBackup = async () => {
  const uid = await getCurrentUserId();
  seedDefaultData(uid);
  const backups = getTable('backups').filter(b => b.userId === uid);
  if (backups.length === 0) return null;
  
  backups.sort((a, b) => {
    const aSec = a.timestamp?.seconds || 0;
    const bSec = b.timestamp?.seconds || 0;
    return bSec - aSec;
  });
  return backups[0];
};

export const migrateLegacyData = async () => {
  return;
};

export const checkHasLegacyData = async () => {
  return false;
};
