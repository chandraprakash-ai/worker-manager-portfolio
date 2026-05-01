import React, { useState, useEffect } from 'react';
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
import { useRef } from 'react';
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
  const { user, login, logout } = useAuthStore();
  const { 
    workers, transactions, fetchWorkers, addWorker, addTransaction, 
    settleWorker, fetchTransactions, addBulkTransactions, getSettlements, 
    getSettlementTransactions, updateTransaction, deleteTransaction,
    allInventory, allInventoryLogs, addInventoryItem, updateInventoryStock, deleteInventoryItem,
    allLots, addLot, updateLotProcess, deleteLot, updateLot
  } = useDataStore();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const isEditTxOpen = location.pathname.includes('/edit-tx');
  const isAddInventoryOpen = location.pathname === '/inventory/add';
  const isUpdateInventoryOpen = location.pathname.includes('/inventory/update/');
  const isAddLotOpen = location.pathname === '/lot/add';
  const isLotDetailOpen = location.pathname.startsWith('/lot/') && !location.pathname.includes('/add');
  
  const [newItem, setNewItem] = useState({ name: '', category: 'Fabric', quantity: '', unit: 'Meters', minThreshold: '5' });
  const [activeInvItem, setActiveInvItem] = useState(null);
  const [updateQty, setUpdateQty] = useState('');
  const defaultStages = ['screening', 'embroidery', 'cutting', 'stitching', 'interlock', 'diamond', 'button', 'steampress'];

  const [newLot, setNewLot] = useState({ 
    lotNumber: '', 
    brand: 'KS4U',
    sizes: {}, 
    itemImage: null,
    sampleImage: null,
    stages: defaultStages
  });

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

  const handleAddLot = (e) => {
    e.preventDefault();
    addLot({
      ...newLot,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'In Progress'
    });
    setNewLot({ 
      lotNumber: '', 
      brand: 'KS4U',
      sizes: {}, 
      itemImage: null,
      sampleImage: null,
      stages: defaultStages
    });
    closeSheet();
    haptic('heavy');
  };


  
  useEffect(() => {
    if (activeWorker) {
      fetchTransactions(activeWorker.id);
    }
  }, [activeWorker?.id]);

  const [viewingSettlement, setViewingSettlement] = useState(null);
  const [editingTx, setEditingTx] = useState(null);

  // Form states
  const [newWorker, setNewWorker] = useState({ name: '', phone: '', address: '' });
  const [newTx, setNewTx] = useState({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [bulkRows, setBulkRows] = useState([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
  const lastRowRef = useRef(null);

  useEffect(() => {
    if (isBulkEntryOpen && lastRowRef.current) {
      lastRowRef.current.focus();
    }
  }, [isBulkEntryOpen, bulkRows.length]);

  useEffect(() => {
    if (user) {
      fetchWorkers();
    }
  }, [user]);

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
    if (success) haptic('medium');
    else haptic('error');
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name.trim()) {
      alert("Worker name cannot be empty.");
      return;
    }
    if (newWorker.phone && !/^\d{10}$/.test(newWorker.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    addWorker({ ...newWorker, id: Date.now().toString() });
    setNewWorker({ name: '', phone: '', address: '' });
    closeSheet();
    haptic('medium');
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (newTx.type === 'work' && (Number(newTx.pieces) <= 0 || Number(newTx.rate) <= 0)) {
      alert("Pieces and Rate must be greater than 0.");
      return;
    }
    if (newTx.type === 'advance' && Number(newTx.amount) <= 0) {
      alert("Advance amount must be greater than 0.");
      return;
    }

    const amount = newTx.type === 'work' ? Number(newTx.pieces) * Number(newTx.rate) : Number(newTx.amount);
    
    if (editingTx) {
      updateTransaction(editingTx.id, { ...newTx, amount });
    } else {
      addTransaction({
        ...newTx,
        id: Date.now().toString(),
        workerId: activeWorker.id,
        amount
      });
    }
    
    setEditingTx(null);
    setNewTx({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
    closeSheet();
    haptic('medium');
    fetchTransactions(activeWorker.id);
  };

  const handleDeleteTx = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteTransaction(id);
      haptic('medium');
    }
  };

  const handleBulkSubmit = async () => {
    const validRows = bulkRows.filter(r => Number(r.pieces) > 0 && Number(r.rate) > 0);
    if (validRows.length === 0) {
      alert("Please enter at least one valid row with Pieces and Rate > 0.");
      return;
    }
    
    validRows.forEach(row => {
      addTransaction({
        id: Math.random().toString(36).substr(2, 9),
        workerId: activeWorker.id,
        type: 'work',
        pieces: row.pieces,
        rate: row.rate,
        amount: Number(row.pieces) * Number(row.rate),
        date: row.date
      });
    });
    
    setBulkRows([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
    closeSheet();
    haptic('heavy');
    fetchTransactions(activeWorker.id);
  };

  const handleSettle = async (balance) => {
    try {
      await settleWorker(activeWorker.id, balance);
      closeSheet();
      haptic('heavy');
      fetchTransactions(activeWorker.id);
    } catch (err) {
      haptic('error');
      alert(`Settlement failed: ${err.message}`);
    }
  };

  const calculateBalance = (txs) => {
    const activeTxs = txs.filter(tx => tx.status === 'active');
    const work = activeTxs.filter(tx => tx.type === 'work').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const advance = activeTxs.filter(tx => tx.type === 'advance').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return work - advance;
  };

  const filteredWorkers = workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  if (!user) {
    return <LoginPage username={username} setUsername={setUsername} pin={pin} setPin={setPin} handleLogin={handleLogin} />;
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-32 font-sans no-print text-[#111111]">
        <Header onLogout={logout} />

        <main className="px-6 py-8 max-w-lg mx-auto">
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

      {/* MODALS */}
      
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
        handleAddWorker={handleAddWorker} 
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
        selectedLot={selectedLot} 
        onUpdateProcess={updateLotProcess}
        onUpdateLot={updateLot}
      />
      </div>
    </>
  );
}

export default App;
