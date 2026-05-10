import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Routes, Route, useNavigate, useLocation, useParams, useSearchParams 
} from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { WorkerDirectory } from './components/workers/WorkerDirectory';
import { WorkerDetail } from './components/workers/WorkerDetail';
import { LotDashboard } from './components/lots/LotDashboard';
import { WorkerModals } from './components/modals/WorkerModals';
import { InventoryModals } from './components/modals/InventoryModals';
import { InventoryDashboard } from './components/inventory/InventoryDashboard';
import { LotModals } from './components/modals/LotModals';

function App() {
  // --- AUTH STORE ---
  const user = useAuthStore(state => state.user);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);

  // --- DATA STORE ---
  const workers = useDataStore(state => state.workers);
  const allLots = useDataStore(state => state.allLots);
  const allInventory = useDataStore(state => state.allInventory);
  const transactions = useDataStore(state => state.transactions);
  const initializeData = useDataStore(state => state.initializeData);
  const isLoading = useDataStore(state => state.isLoading);
  const error = useDataStore(state => state.error);
  const fetchTransactions = useDataStore(state => state.fetchTransactions);
  const addWorker = useDataStore(state => state.addWorker);
  const updateWorker = useDataStore(state => state.updateWorker);
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
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
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

  const defaultStages = ['screening', 'embroidery', 'cutting', 'stitching', 'interlock', 'diamond', 'button', 'steampress'];
  const [newLot, setNewLot] = useState({ 
    lotNumber: '', 
    brand: 'KS4U',
    sizes: {}, 
    itemImage: null,
    sampleImage: null,
    stages: defaultStages,
    processes: [
      { id: 'screening', name: 'Screening', pieces: 0, isDone: false },
      { id: 'embroidery', name: 'Embroidery', pieces: 0, isDone: false },
      { id: 'diamond', name: 'Diamond', pieces: 0, isDone: false },
      { id: 'button', name: 'Button', pieces: 0, isDone: false },
      { id: 'finishing', name: 'Finishing', pieces: 0, isDone: false },
    ]
  });

  // --- EFFECTS ---
  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user, initializeData]);

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
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, pin);
    if (success) {
      haptic('medium');
    } else haptic('error');
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
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteTransaction(id);
      haptic('medium');
    }
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
    const lotToSave = cloudData || newLot;
    
    try {
      await addLot(lotToSave);
      
      // Reset state only AFTER successful save
      setNewLot({ 
        lotNumber: '', 
        brand: 'KS4U',
        sizes: {}, 
        itemImage: null,
        sampleImage: null,
        notes: '',
        processes: [
          { id: 'screening', name: 'Screening', pieces: 0, isDone: false },
          { id: 'embroidery', name: 'Embroidery', pieces: 0, isDone: false },
          { id: 'diamond', name: 'Diamond', pieces: 0, isDone: false },
          { id: 'button', name: 'Button', pieces: 0, isDone: false },
          { id: 'finishing', name: 'Finishing', pieces: 0, isDone: false },
        ]
      });
      
      closeSheet();
      haptic('medium');
    } catch (err) {
      console.error("Failed to add lot:", err);
      // Local error handling would usually happen in the Modal component
    }
  };



  // --- EARLY RETURNS ---
  if (!user) {
    return <LoginPage username={username} setUsername={setUsername} pin={pin} setPin={setPin} handleLogin={handleLogin} />;
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#111111]/30 italic">Decrypting Ledger...</p>
      </div>
    );
  }

  // --- MAIN RENDER ---
  const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] pb-32 font-sans no-print text-[#111111]">
        {isHomePage && <Header onLogout={logout} />}

        <main className="px-6 py-8 max-w-7xl mx-auto">
          {isHomePage && <HomeDashboard navigate={navigate} workers={workers} />}

          {isWorkersPage && !activeWorker && (
            <WorkerDirectory 
              search={search} 
              setSearch={setSearch} 
              workers={filteredWorkers} 
              onOpenSheet={openSheet} 
              onNavigate={navigate} 
            />
          )}

          {activeWorker && (
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
          )}

          {isInventoryPage && (
            <InventoryDashboard 
              search={search} 
              setSearch={setSearch} 
              allInventory={allInventory} 
              onNavigate={navigate} 
              onOpenSheet={openSheet} 
              setActiveInvItem={setActiveInvItem} 
            />
          )}

          {isLotPage && (
            <LotDashboard 
              search={search} 
              setSearch={setSearch} 
              allLots={allLots} 
              onNavigate={navigate} 
              onOpenSheet={openSheet} 
            />
          )}
        </main>

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
      </div>
    </>
  );
}

export default App;
