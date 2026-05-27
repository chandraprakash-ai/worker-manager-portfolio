import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { 
  LogOut, Plus, Search, ChevronRight, User, Phone, MapPin, 
  IndianRupee, FileText, CheckCircle2, Trash2, History, 
  Calendar, Layers, ArrowLeft, Edit2, Package, ShoppingCart, 
  BarChart3, Users, Home, Settings, X, Filter, Minus, AlertTriangle,
  ClipboardList, Camera, Layout
} from 'lucide-react';
import { BottomSheet } from './components/ui/BottomSheet';
import { haptic } from './utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF } from './utils/generateInvoice';
import * as fs from './lib/firebaseServices';
import { 
  Routes, Route, useNavigate, useLocation, useParams, useSearchParams 
} from 'react-router-dom';
import { PullToRefresh } from './components/ui/PullToRefresh';
import { FloatingNavbar } from './components/layout/FloatingNavbar';

// Lazy loaded components for Lightning Fast Startup
const HomeDashboard = React.lazy(() => import('./components/dashboard/HomeDashboard').then(m => ({ default: m.HomeDashboard })));
const WorkerDirectory = React.lazy(() => import('./components/workers/WorkerDirectory').then(m => ({ default: m.WorkerDirectory })));
const WorkerDetail = React.lazy(() => import('./components/workers/WorkerDetail').then(m => ({ default: m.WorkerDetail })));
const LotDashboard = React.lazy(() => import('./components/lots/LotDashboard').then(m => ({ default: m.LotDashboard })));
const WorkerModals = React.lazy(() => import('./components/modals/WorkerModals').then(m => ({ default: m.WorkerModals })));
const InventoryModals = React.lazy(() => import('./components/modals/InventoryModals').then(m => ({ default: m.InventoryModals })));
const InventoryDashboard = React.lazy(() => import('./components/inventory/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const LotModals = React.lazy(() => import('./components/modals/LotModals').then(m => ({ default: m.LotModals })));
const BackupModal = React.lazy(() => import('./components/modals/BackupModal').then(m => ({ default: m.BackupModal })));

function App() {
  // --- AUTH STORE ---
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const authLoading = useAuthStore(state => state.isLoading);
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  // --- AUTH SHIELD INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initializeAuth]);

  // --- DATA STORE ---
  const workers = useDataStore(state => state.workers);
  const allLots = useDataStore(state => state.allLots);
  const allInventory = useDataStore(state => state.allInventory);
  const allSettlements = useDataStore(state => state.allSettlements);
  const transactions = useDataStore(state => state.transactions);
  const initializeData = useDataStore(state => state.initializeData);
  const resetStore = useDataStore(state => state.resetStore);
  const isLoading = useDataStore(state => state.isLoading);
  const error = useDataStore(state => state.error);

  // --- AUTOMATED BACKUP LOGIC ---
  useEffect(() => {
    const handleAutoBackup = async () => {
      if (isLoading || workers.length === 0) return;

      try {
        const latestBackup = await fs.fetchLatestBackup();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        let shouldBackup = false;
        if (!latestBackup) {
          shouldBackup = true;
        } else {
          const lastTimestamp = latestBackup.timestamp?.seconds * 1000 || 0;
          if (now - lastTimestamp > oneDay) {
            shouldBackup = true;
          }
        }

        if (shouldBackup) {
          const allBackupData = {
            workers: workers,
            lots: allLots,
            inventory: allInventory,
            transactions: transactions,
            settlements: allSettlements
          };
          
          await fs.createCloudBackup(allBackupData);
          console.log("✅ Daily Cloud Auto-Backup Created Successfully");
        }
      } catch (err) {
        console.error("❌ Auto-Backup Check Failed:", err);
      }
    };

    handleAutoBackup();
  }, [isLoading, workers.length]);

  const fetchTransactions = useDataStore(state => state.fetchTransactions);
  const addWorker = useDataStore(state => state.addWorker);
  const updateWorker = useDataStore(state => state.updateWorker);
  const deleteWorker = useDataStore(state => state.deleteWorker);
  const addTransaction = useDataStore(state => state.addTransaction);
  const settleWorker = useDataStore(state => state.settleWorker);
  const addLot = useDataStore(state => state.addLot);
  const updateLot = useDataStore(state => state.updateLot);
  const updateLotProcess = useDataStore(state => state.updateLotProcess);
  const deleteLot = useDataStore(state => state.deleteLot);
  const addInventoryItem = useDataStore(state => state.addInventoryItem);
  const updateInventoryStock = useDataStore(state => state.updateInventoryStock);
  const deleteInventoryItem = useDataStore(state => state.deleteInventoryItem);
  const getSettlements = useDataStore(state => state.getSettlements);
  const getSettlementTransactions = useDataStore(state => state.getSettlementTransactions);
  const updateTransaction = useDataStore(state => state.updateTransaction);
  const deleteTransaction = useDataStore(state => state.deleteTransaction);
  const addBulkTransactions = useDataStore(state => state.addBulkTransactions);

  // --- LOCAL UI STATE ---
  const [search, setSearch] = useState('');
  const [viewingSettlement, setViewingSettlement] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '', address: '' });
  const [newTx, setNewTx] = useState({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [bulkRows, setBulkRows] = useState([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
  const [newItem, setNewItem] = useState({ name: '', category: 'Fabric', quantity: '', unit: 'Meters', minThreshold: '5' });
  const [activeInvItem, setActiveInvItem] = useState(null);
  const [updateQty, setUpdateQty] = useState('');
  
  // --- NAVIGATION & ROUTING ---
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastRowRef = useRef(null);

  const selectedWorkerId = location.pathname.split('/worker/')[1]?.split('/')[0];
  const activeWorker = workers.find(w => w.id === selectedWorkerId);
  const selectedLotId = location.pathname.split('/lot/')[1]?.split('/')[0];
  const selectedLot = allLots.find(l => l.id === selectedLotId);
  
  const isHomePage = location.pathname === '/';
  const isWorkersPage = location.pathname.startsWith('/worker') || location.pathname === '/workers' || location.pathname === '/add-worker';
  const isInventoryPage = location.pathname.startsWith('/inventory');
  const isLotPage = location.pathname.startsWith('/lot');
  const isHistoryOpen = location.pathname.includes('/history');
  const isBulkEntryOpen = location.pathname.includes('/bulk');
  const isSettlementOpen = location.pathname.includes('/settle');
  const isAddWorkerOpen = location.pathname === '/add-worker';
  const isEditWorkerOpen = location.pathname.includes('/edit-worker');
  const isEditTxOpen = location.pathname.includes('/edit-tx') || location.pathname.includes('/add-tx');
  const isAddInventoryOpen = location.pathname === '/inventory/add';
  const isUpdateInventoryOpen = location.pathname.includes('/inventory/update/');
  const isAddLotOpen = location.pathname.includes('/lot/add');
  const isLotDetailOpen = location.pathname.startsWith('/lot/') && !location.pathname.endsWith('/add');
  const isExtendSizesOpen = location.pathname.endsWith('/add-sizes');
  const isSystemOpen = location.pathname === '/system';


  const INITIAL_STAGES = [
    'Screening', 
    'Embroidery', 
    'Cutting',
    'Stitching',
    'Interlock',
    'Diamond', 
    'Button', 
    'Steam Press'
  ];

  const [newLot, setNewLot] = useState({ 
    lotNumber: '', 
    brand: 'KS4U',
    sizes: {}, 
    itemImage: null,
    sampleImage: null,
    stages: [],
    processes: [],
    numColors: 1,
    avg: '',
    rate: ''
  });

  // --- EFFECTS ---
  useEffect(() => {
    if (user) {
      initializeData();
    } else {
      resetStore();
    }
  }, [initializeData, resetStore, user]);

  useEffect(() => {
    if (selectedWorkerId) {
      fetchTransactions(selectedWorkerId);
    }
  }, [selectedWorkerId, fetchTransactions]);

  useEffect(() => {
    if (isBulkEntryOpen && lastRowRef.current) {
      lastRowRef.current.focus();
    }
  }, [isBulkEntryOpen, bulkRows.length]);

  // --- HANDLERS ---
  const openSheet = (path) => {
    haptic();
    navigate(path);
  };

  const closeSheet = () => {
    navigate(-1);
    haptic('light');
  };



  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name.trim()) {
      alert("Worker name cannot be empty.");
      return;
    }
    addWorker(newWorker);
    setNewWorker({ name: '', phone: '', address: '' });
    closeSheet();
    haptic('medium');
  };

  const handleUpdateWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name.trim()) {
      alert("Worker name cannot be empty.");
      return;
    }
    updateWorker(activeWorker.id, newWorker);
    setNewWorker({ name: '', phone: '', address: '' });
    closeSheet();
    haptic('medium');
  };

  const handleDeleteWorker = async (id) => {
    await deleteWorker(id);
    closeSheet();
    navigate('/workers');
    haptic('heavy');
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    const pieces = Number(newTx.pieces) || 0;
    const rate = Number(newTx.rate) || 0;
    const amount = newTx.type === 'work' ? pieces * rate : (Number(newTx.amount) || 0);
    
    // Create a clean object with ONLY relevant fields
    const sanitizedTx = {
      type: newTx.type,
      amount: amount,
      date: newTx.date,
      status: 'active'
    };

    // Only add pieces/rate if it's actual work
    if (newTx.type === 'work') {
      sanitizedTx.pieces = pieces;
      sanitizedTx.rate = rate;
    }

    if (editingTx) {
      updateTransaction(editingTx.id, sanitizedTx);
    } else {
      addTransaction({
        ...sanitizedTx,
        workerId: activeWorker.id
      });
    }
    
    setEditingTx(null);
    setNewTx({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
    closeSheet();
    haptic('medium');
};

  const handleDeleteTx = async (id) => {
    await deleteTransaction(id);
    haptic('medium');
  };

  const handleBulkSubmit = async () => {
    // Check for partially filled rows
    const incompleteRows = bulkRows.filter(r => (r.pieces || r.rate) && (!r.pieces || !r.rate || Number(r.pieces) <= 0 || Number(r.rate) <= 0));
    if (incompleteRows.length > 0) {
      alert("Some entries are incomplete. Please enter both Pieces and Rate for all rows.");
      return;
    }

    const validRows = bulkRows.filter(r => Number(r.pieces) > 0 && Number(r.rate) > 0);
    if (validRows.length === 0) {
      alert("Please enter at least one valid row.");
      return;
    }
    
    // Sanitize and format for Firebase
    const sanitizedRows = validRows.map(row => ({
      workerId: activeWorker.id,
      type: 'work',
      pieces: Number(row.pieces),
      rate: Number(row.rate),
      amount: Number(row.pieces) * Number(row.rate),
      date: row.date,
      status: 'active'
    }));

    await addBulkTransactions(sanitizedRows);
    
    setBulkRows([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
    closeSheet();
    haptic('heavy');
    fetchTransactions(activeWorker.id);
  };

  const calculateBalance = (txs) => {
    const activeTxs = txs.filter(tx => tx.status === 'active');
    // Work is only positive work type
    const work = activeTxs.filter(tx => tx.type === 'work').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    // Advance is everything else (defensive)
    const advance = activeTxs.filter(tx => tx.type !== 'work').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return work - advance;
  };

  const handleSettle = async (balance) => {
    try {
      // Only settle transactions that actually contributed to the balance
      const activeTxs = transactions.filter(tx => tx.status === 'active');
      const validTxs = activeTxs.filter(tx => tx.type === 'work' || tx.type === 'advance');
      
      if (validTxs.length === 0) {
        alert("No valid transactions to settle.");
        return;
      }

      await settleWorker(activeWorker.id, balance, validTxs);
      closeSheet();
      haptic('heavy');
      fetchTransactions(activeWorker.id);
    } catch (err) {
      alert(`Settlement failed: ${err.message}`);
    }
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    addInventoryItem(newItem);
    setNewItem({ name: '', category: 'Fabric', quantity: '', unit: 'Meters', minThreshold: '5' });
    closeSheet();
    haptic('medium');
  };

  const handleInventoryUpdate = (e, delta, reason) => {
    e.preventDefault();
    updateInventoryStock(activeInvItem.id, delta, reason);
    setUpdateQty('');
    closeSheet();
    haptic('medium');
  };

  const handleAddLot = async (e, cloudData = null) => {
    if (e) e.preventDefault();
    let lotToSave = cloudData || newLot;
    
    // Smart Fallback: If no stages selected, use all 8 default
    if (!lotToSave.stages || lotToSave.stages.length === 0) {
      lotToSave = {
        ...lotToSave,
        stages: INITIAL_STAGES,
        processes: INITIAL_STAGES.map(s => ({
          id: s.toLowerCase().replace(/\s+/g, ''),
          name: s,
          isDone: false,
          pieces: 0,
          billNumber: '',
          notes: '',
          pricePerPc: 0,
          numButtons: 0
        }))
      };
    }
    
    try {
      await addLot(lotToSave);
      
      // Reset state only AFTER successful save
      setNewLot({ 
        lotNumber: '', 
        brand: 'KS4U',
        sizes: {}, 
        itemImage: null,
        sampleImage: null,
        stages: [],
        processes: [],
        numColors: 1,
        avg: '',
        rate: ''
      });
      
      closeSheet();
      haptic('medium');
    } catch (err) {
      console.error("Failed to add lot:", err);
      // Local error handling would usually happen in the Modal component
    }
  };



  // --- EARLY RETURNS ---

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1, 0.95] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
          className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA] p-10 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-display font-black text-[#111111] mb-2">Connection Issue</h2>
        <p className="text-sm text-[#111111]/40 max-w-xs mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-[#111111] text-white px-8 py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-xl">Try Reconnecting</button>
      </div>
    );
  }

  if (isLoading && !workers.length && !allLots.length) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1, 0.95] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
          className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </div>
    );
  }

  const LoadingFallback = () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-12 h-12 border-4 border-[#111111]/10 border-t-[#D4AF37] rounded-full animate-spin"></div>
    </div>
  );

  // --- MAIN RENDER ---
  const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] pb-24 font-sans no-print text-[#111111]">
        <main className="px-6 py-8 max-w-7xl mx-auto overflow-x-hidden">
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="popLayout">
              {isHomePage && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HomeDashboard 
                    navigate={navigate} 
                    workers={workers} 
                    lots={allLots}
                    inventory={allInventory}
                    transactions={transactions}
                    onOpenSheet={openSheet}
                  />
                </motion.div>
              )}

              {isWorkersPage && !activeWorker && (
                <motion.div
                  key="workers"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <WorkerDirectory 
                    search={search} 
                    setSearch={setSearch} 
                    workers={filteredWorkers} 
                    onOpenSheet={openSheet} 
                    onNavigate={navigate} 
                  />
                </motion.div>
              )}

              {isLotPage && !selectedLotId && (
                <motion.div
                  key="lots"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <LotDashboard 
                    search={search} 
                    setSearch={setSearch} 
                    allLots={allLots} 
                    onNavigate={navigate} 
                    onOpenSheet={openSheet} 
                  />
                </motion.div>
              )}

              {isSystemOpen && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <BackupModal 
                    onLogout={logout}
                    allData={{
                      workers: workers,
                      lots: allLots,
                      inventory: allInventory,
                      transactions: transactions,
                      settlements: allSettlements
                    }}
                  />
                </motion.div>
              )}

              {/* Detail Views (Slide In from Right) */}
              {activeWorker && (
                <motion.div
                  key={`worker-${activeWorker.id}`}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-0 z-[110] bg-[#FAFAFA] overflow-y-auto px-6 py-8 pb-44"
                >
                  <WorkerDetail 
                    activeWorker={activeWorker} 
                    transactions={activeTransactions} 
                    calculateBalance={calculateBalance} 
                    onNavigate={navigate} 
                    onOpenSheet={openSheet} 
                    setEditingTx={setEditingTx} 
                    setNewTx={setNewTx} 
                    setNewWorker={setNewWorker}
                    generateInvoicePDF={generateInvoicePDF} 
                  />
                </motion.div>
              )}

              {isInventoryPage && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <InventoryDashboard 
                    search={search} 
                    setSearch={setSearch} 
                    allInventory={allInventory} 
                    onNavigate={navigate} 
                    onOpenSheet={openSheet} 
                    setActiveInvItem={setActiveInvItem} 
                  />
                </motion.div>
              )}
          </AnimatePresence>
         </Suspense>
        </main>

      <Suspense fallback={null}>
      <WorkerModals 
        isBulkEntryOpen={isBulkEntryOpen} 
        closeSheet={closeSheet} 
        bulkRows={bulkRows} 
        setBulkRows={setBulkRows} 
        handleBulkSubmit={handleBulkSubmit}
        isHistoryOpen={isHistoryOpen} 
        viewingSettlement={viewingSettlement} 
        setViewingSettlement={setViewingSettlement} 
        getSettlements={getSettlements} 
        activeWorker={activeWorker} 
        getSettlementTransactions={getSettlementTransactions} 
        generateInvoicePDF={generateInvoicePDF}
        isAddWorkerOpen={isAddWorkerOpen} 
        isEditWorkerOpen={isEditWorkerOpen}
        handleAddWorker={handleAddWorker} 
        handleUpdateWorker={handleUpdateWorker}
        handleDeleteWorker={handleDeleteWorker}
        newWorker={newWorker} 
        setNewWorker={setNewWorker}
        isEditTxOpen={isEditTxOpen} 
        editingTx={editingTx} 
        newTx={newTx} 
        setNewTx={setNewTx} 
        handleUpdateTransaction={handleSubmitTransaction} 
        deleteTransaction={handleDeleteTx}
        isSettlementOpen={isSettlementOpen} 
        calculateBalance={calculateBalance} 
        transactions={transactions} 
        handleSettle={handleSettle} 
        activeTransactions={activeTransactions}
      />

      <InventoryModals 
        isAddInventoryOpen={isAddInventoryOpen} 
        closeSheet={closeSheet} 
        handleAddInventory={handleAddInventory} 
        newItem={newItem} 
        setNewItem={setNewItem}
        isUpdateInventoryOpen={isUpdateInventoryOpen} 
        activeInvItem={activeInvItem} 
        updateQty={updateQty} 
        setUpdateQty={setUpdateQty} 
        handleInventoryUpdate={handleInventoryUpdate}
      />

      <LotModals 
        isAddLotOpen={isAddLotOpen} 
        closeSheet={closeSheet} 
        handleAddLot={handleAddLot} 
        newLot={newLot} 
        setNewLot={setNewLot}
        isLotDetailOpen={isLotDetailOpen} 
        isExtendSizesOpen={isExtendSizesOpen}
        selectedLot={selectedLot} 
        onUpdateProcess={updateLotProcess}
        onUpdateLot={updateLot}
        onDeleteLot={deleteLot}
        onOpenSheet={openSheet}
        onNavigate={navigate}
      />
      </Suspense>

      {/* Anchored FABs (Outside PullToRefresh to prevent jumping) */}
      <AnimatePresence>
        {isWorkersPage && !activeWorker && !isAddWorkerOpen && !isSystemOpen && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => openSheet('/add-worker')} 
            className="fixed bottom-20 right-6 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
          >
            <Plus size={32} strokeWidth={3} />
          </motion.button>
        )}

        {isLotPage && !isLotDetailOpen && !isAddLotOpen && !isSystemOpen && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => openSheet('/lot/add')} 
            className="fixed bottom-20 right-6 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-premium flex items-center justify-center active:scale-95 hover:scale-105 transition-all border-2 border-[#D4AF37]/20 group"
          >
            <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
          </motion.button>
        )}
      </AnimatePresence>

      <FloatingNavbar />
      </div>
    </>
  );
}

export default App;
