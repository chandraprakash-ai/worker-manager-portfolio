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
    allLots, addLot, updateLotProcess, deleteLot
  } = useDataStore();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync state with URL
  const selectedWorkerId = location.pathname.split('/worker/')[1]?.split('/')[0];
  const activeWorker = workers.find(w => w.id === selectedWorkerId);
  
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
  const [newLot, setNewLot] = useState({ lotNumber: '', sizes: { M: '', L: '', XL: '', '2XL': '' }, image: '' });
  const [selectedLot, setSelectedLot] = useState(null);

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
    addLot(newLot);
    setNewLot({ lotNumber: '', sizes: { M: '', L: '', XL: '', '2XL': '' }, image: '' });
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
    // If we have a modal on top of a worker view, go back to worker view
    // If we are at root, navigate to /
    if (location.pathname.includes('/worker/')) {
      const parts = location.pathname.split('/');
      navigate(`/worker/${parts[2]}`);
    } else if (isWorkersPage) {
      navigate('/workers');
    } else {
      navigate('/');
    }
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
              setSelectedLot={setSelectedLot} 
            />
          )}
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><Users size={20} /></div>
                <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest mb-1">Professionals</p>
                <h4 className="text-2xl font-display font-bold text-[#111111]">{workers.length} Active</h4>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div>
                <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest mb-1">Inventory</p>
                <h4 className="text-2xl font-display font-bold text-[#111111]">1.2k SKU</h4>
              </div>
            </div>

            {/* Module Selection */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#111111]/20 uppercase tracking-[0.2em] ml-2">Business Operations</h3>
              <div className="grid gap-4">
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate('/workers')} className="bg-[#111111] text-white p-8 rounded-[2rem] shadow-2xl flex justify-between items-center group cursor-pointer overflow-hidden relative border border-white/10">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
                  <div className="flex items-center gap-6 z-10">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-inner"><Users size={32} className="text-[#D4AF37]" /></div>
                    <div>
                      <h4 className="text-2xl font-display font-black tracking-tight text-white">Workers Ledger</h4>
                      <p className="text-xs text-white/40 font-medium tracking-wide">Payroll & Daily logs</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/5"><ChevronRight size={20} className="text-[#D4AF37]" /></div>
                </motion.div>

                <div onClick={() => navigate('/inventory')} className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Package size={32} /></div>
                    <div>
                      <h4 className="text-2xl font-display font-bold tracking-tight">Inventory Control</h4>
                      <p className="text-xs text-surface-300 font-medium">Stock & Raw materials</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
                </div>

                <div onClick={() => navigate('/lots')} className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ClipboardList size={32} /></div>
                    <div>
                      <h4 className="text-2xl font-display font-bold tracking-tight">Production (Lots)</h4>
                      <p className="text-xs text-surface-300 font-medium">Job cards & Batch tracking</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center opacity-40 grayscale pointer-events-none">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]/20"><BarChart3 size={32} /></div>
                    <div>
                      <h4 className="text-2xl font-display font-bold tracking-tight">Analytics AI</h4>
                      <p className="text-xs text-surface-300 font-medium">Profit & Growth insights</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1.5 rounded-full text-surface-400">Locked</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!activeWorker ? (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                   <button onClick={() => navigate('/')} className="bg-[#111111] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"><Home size={18} /></button>
                   <h2 className="text-3xl text-[#111111] font-display font-black tracking-tight">Workers Directory</h2>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111111]/20" size={20} />
                  <input type="text" placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-surface-100 rounded-[1.5rem] py-5 pl-14 pr-6 shadow-sm focus:border-[#D4AF37]/30 outline-none transition-all font-medium" />
                </div>

                <div className="grid gap-4 pb-12">
                  {filteredWorkers.map(worker => (
                    <motion.div key={worker.id} whileTap={{ scale: 0.97 }} onClick={() => openSheet(`/worker/${worker.id}`)} className="bg-white p-5 rounded-[1.5rem] border border-surface-50 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex-shrink-0 bg-[#111111] text-[#D4AF37] rounded-xl flex items-center justify-center font-black text-lg border border-[#D4AF37]/10 shadow-sm group-hover:scale-105 transition-transform">{worker.name.charAt(0)}</div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-[#111111] leading-tight truncate">{worker.name}</h3>
                          <p className="text-[10px] text-[#111111]/30 font-black tracking-widest mt-0.5 uppercase">{worker.phone}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
                    </motion.div>
                  ))}
                  {filteredWorkers.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                      <Users size={40} className="mx-auto mb-3" />
                      <p className="text-xs font-black uppercase tracking-widest">No workers found</p>
                    </div>
                  )}
                </div>

                {/* Floating Action Button */}
                <button 
                  onClick={() => openSheet('/add-worker')} 
                  className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>
            ) : (
          <div className="space-y-8">
            <button onClick={() => navigate('/workers')} className="text-[#111111]/30 font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 mb-2 bg-white px-5 py-2.5 rounded-xl border border-surface-100 shadow-sm active:scale-95 transition-all"><ArrowLeft size={12} className="text-[#D4AF37]" /> Back to Workers</button>

            <div className="bg-[#111111] text-white p-6 rounded-[2.5rem] shadow-premium relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-1">{activeWorker.name}</h2>
                  <div className="flex gap-3 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Phone size={10} className="text-[#D4AF37]" /> {activeWorker.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={10} className="text-[#D4AF37]" /> {activeWorker.address?.slice(0, 15) || 'No Address'}...</span>
                  </div>
                </div>
                <button onClick={() => openSheet(`/worker/${activeWorker.id}/history`)} className="bg-white/10 backdrop-blur-xl p-2.5 rounded-xl border border-white/5 text-[#D4AF37]">
                  <History size={20} />
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-5 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[#D4AF37] text-[8px] uppercase tracking-[0.2em] font-black mb-1 opacity-80">Payable Balance</p>
                  <h4 className="text-3xl font-display font-bold">₹{calculateBalance(transactions).toLocaleString()}</h4>
                </div>
                <div className="text-right">
                  <span className="bg-white/10 text-white/40 text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-tighter">Active View</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => openSheet(`/worker/${activeWorker.id}/add-tx`)} className="bg-white border border-surface-100 p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"><Plus size={24} className="text-[#111111]" /><span className="text-[10px] font-black uppercase tracking-tighter text-[#111111]/60">Single</span></button>
              <button onClick={() => openSheet(`/worker/${activeWorker.id}/bulk`)} className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-5 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all"><Layers size={24} className="text-[#D4AF37]" /><span className="text-[10px] font-black uppercase tracking-tighter text-[#D4AF37]">Bulk Entry</span></button>
              <button onClick={() => openSheet(`/worker/${activeWorker.id}/settle`)} className="bg-[#111111] text-white p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-premium active:scale-95 transition-all"><IndianRupee size={24} /><span className="text-[10px] font-black uppercase tracking-tighter text-white/80">Settle</span></button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-display font-bold text-[#111111]">Recent Work</h3>
                <span className="text-surface-300 text-[9px] font-bold uppercase tracking-widest">{activeTransactions.length} items</span>
              </div>
              <div className="space-y-3">
                {activeTransactions.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-surface-100 rounded-[2rem] py-12 text-center">
                    <p className="text-surface-200 font-bold uppercase tracking-widest text-[10px]">No Active Transactions</p>
                  </div>
                )}
                {activeTransactions.map(tx => (
                  <div 
                    key={tx.id} 
                    onClick={() => {
                      setEditingTx(tx);
                      setNewTx({ ...tx, date: tx.date.split('T')[0] });
                      openSheet(`/worker/${activeWorker.id}/edit-tx/${tx.id}`);
                    }}
                    className="bg-white p-6 rounded-3xl border border-surface-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer hover:border-[#111111]/10"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'work' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'work' ? <CheckCircle2 size={22} /> : <IndianRupee size={22} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#111111] uppercase tracking-tight">{tx.type === 'work' ? 'Work Log' : 'Advance'}</p>
                        </div>
                        <p className="text-[10px] text-surface-300 font-bold flex items-center gap-1 mt-1"><Calendar size={10} /> {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-display font-bold ${tx.type === 'work' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'work' ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                      </p>
                      {tx.type === 'work' && <p className="text-[10px] text-surface-300 font-bold">{tx.pieces} pcs × ₹{tx.rate}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    )}
      {isInventoryPage && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="bg-[#111111] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"><Home size={18} /></button>
              <h2 className="text-3xl text-[#111111] font-display font-black tracking-tight">Stock Inventory</h2>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111111]/20" size={20} />
            <input 
              type="text" 
              placeholder="Search Fabric, Threads, Buttons..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-white border border-surface-100 rounded-[1.5rem] py-5 pl-14 pr-6 shadow-sm focus:border-[#D4AF37]/30 outline-none transition-all font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pb-20">
            {allInventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())).map(item => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full mb-3 inline-block">{item.category}</span>
                    <h3 className="text-xl font-display font-bold text-[#111111]">{item.name}</h3>
                    <p className="text-[10px] text-surface-300 font-bold uppercase tracking-tighter mt-1">Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-display font-bold ${item.quantity <= item.minThreshold ? 'text-red-500' : 'text-[#111111]'}`}>{item.quantity}</p>
                    <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest">{item.unit}</p>
                  </div>
                </div>

                {item.quantity <= item.minThreshold && (
                  <div className="flex items-center gap-2 bg-red-50 p-3 rounded-xl text-red-600">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Low Stock Alert</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setActiveInvItem(item); openSheet(`/inventory/update/${item.id}`); }}
                    className="bg-[#111111] text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-premium"
                  >
                    <Plus size={16} /> Restock
                  </button>
                  <button 
                    onClick={() => { setActiveInvItem(item); openSheet(`/inventory/update/${item.id}`); }}
                    className="bg-[#F5F5F5] text-[#111111] py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Minus size={16} /> Use
                  </button>
                </div>
              </motion.div>
            ))}
            {allInventory.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <Package size={64} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">No items in inventory</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => openSheet('/inventory/add')} 
            className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
        )}
      {isLotPage && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="bg-[#111111] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"><Home size={18} /></button>
            <h2 className="text-3xl text-[#111111] font-display font-black tracking-tight">Production Master</h2>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111111]/20" size={20} />
            <input 
              type="text" 
              placeholder="Search Lot Number..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-white border border-surface-100 rounded-[1.5rem] py-5 pl-14 pr-6 shadow-sm focus:border-[#D4AF37]/30 outline-none transition-all font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {allLots.filter(l => l.lotNumber.includes(search)).map(lot => (
              <motion.div 
                key={lot.id} 
                onClick={() => { setSelectedLot(lot); openSheet(`/lot/${lot.id}`); }}
                className="bg-white rounded-[2.5rem] border border-surface-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="h-40 bg-[#F5F5F5] relative overflow-hidden flex items-center justify-center text-[#111111]/10">
                  {lot.image ? <img src={lot.image} className="w-full h-full object-cover" /> : <Layout size={48} />}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#111111]">Lot #{lot.lotNumber}</div>
                  <div className="absolute bottom-4 right-4 bg-[#111111] text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{lot.status}</div>
                </div>
                <div className="p-6">
                   <div className="grid grid-cols-4 gap-2 mb-6">
                     {Object.entries(lot.sizes).map(([size, qty]) => (
                       <div key={size} className="bg-[#F5F5F5] p-2 rounded-xl text-center">
                         <p className="text-[8px] font-black text-[#111111]/30 uppercase mb-0.5">{size}</p>
                         <p className="text-xs font-bold text-[#111111]">{qty || 0}</p>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest">Total Production</p>
                        <h4 className="text-xl font-display font-bold text-[#111111]">{Object.values(lot.sizes).reduce((a, b) => Number(a) + Number(b), 0)} Pcs</h4>
                     </div>
                     <div className="flex -space-x-2">
                        {lot.processes.slice(0, 4).map((p, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${p.status === 'Done' ? 'bg-green-500 text-white' : 'bg-[#111111] text-[#D4AF37]'}`}>{p.name.charAt(0)}</div>
                        ))}
                        {lot.processes.length > 4 && <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-100 flex items-center justify-center text-[8px] font-black text-surface-400">+{lot.processes.length - 4}</div>}
                     </div>
                   </div>
                </div>
              </motion.div>
            ))}
            {allLots.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <ClipboardList size={64} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">No production lots active</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => openSheet('/lot/add')} 
            className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
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
      />
      </div>
    </>
  );
}

export default App;
