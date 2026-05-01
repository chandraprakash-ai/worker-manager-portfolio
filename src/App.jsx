import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { 
  LogOut, Plus, Search, ChevronRight, User, Phone, MapPin, 
  IndianRupee, FileText, CheckCircle2, Trash2, History, 
  Calendar, Layers, ArrowLeft, Edit2, Package, ShoppingCart, 
  BarChart3, Users, Home, Settings, X
} from 'lucide-react';
import { BottomSheet } from './components/ui/BottomSheet';
import { haptic } from './utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { generateInvoicePDF } from './utils/generateInvoice';
import { 
  Routes, Route, useNavigate, useLocation, useParams, useSearchParams 
} from 'react-router-dom';

function App() {
  const { user, login, logout } = useAuthStore();
  const { 
    workers, transactions, fetchWorkers, addWorker, addTransaction, 
    settleWorker, fetchTransactions, addBulkTransactions, getSettlements, 
    getSettlementTransactions, updateTransaction, deleteTransaction 
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
  
  const isHistoryOpen = location.pathname.includes('/history');
  const isBulkEntryOpen = location.pathname.includes('/bulk');
  const isSettlementOpen = location.pathname.includes('/settle');
  const isAddWorkerOpen = location.pathname === '/add-worker';
  const isEditTxOpen = location.pathname.includes('/edit-tx');
  
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

  const handleAddTx = (e) => {
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
    const txData = {
      ...newTx,
      id: Date.now().toString(),
      workerId: activeWorker.id,
      amount
    };
    
    addTransaction(txData);
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
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">AMRUT FASHION</h1>
            <p className="text-surface-300 font-medium tracking-[0.2em] text-[10px] uppercase">Crafting Excellence Since 1998</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium" placeholder="Manager ID" />
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium" placeholder="Security PIN" />
            <button type="submit" className="w-full btn-primary py-5 text-lg shadow-premium">Authorize Session</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-32 font-sans no-print text-[#111111]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#111111] text-[#D4AF37] rounded-xl flex items-center justify-center font-black text-lg border border-[#D4AF37]/20 shadow-sm">A</div>
          <div>
            <h1 className="text-sm font-display font-black text-[#111111] tracking-tight">AMRUT FASHION</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[9px] text-[#111111]/40 font-black uppercase tracking-tighter">Live Session</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="w-9 h-9 bg-surface-50 rounded-xl text-[#111111]/40 flex items-center justify-center active:scale-90 transition-all border border-surface-100"><LogOut size={16} /></button>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        {isHomePage ? (
          <div className="space-y-10">
            {/* Header Greeting */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.3em] mb-2">Workspace Dashboard</p>
                <h2 className="text-4xl font-display font-black text-[#111111] leading-tight">Welcome,<br/>Amrut Fashion</h2>
              </div>
              <div className="w-14 h-14 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]">
                <Settings size={24} />
              </div>
            </div>

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

                <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center opacity-40 grayscale pointer-events-none">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]/20"><Package size={32} /></div>
                    <div>
                      <h4 className="text-2xl font-display font-bold tracking-tight">Inventory Control</h4>
                      <p className="text-xs text-surface-300 font-medium">Stock & Raw materials</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1.5 rounded-full text-surface-400">Locked</span>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center opacity-40 grayscale pointer-events-none">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]/20"><ShoppingCart size={32} /></div>
                    <div>
                      <h4 className="text-2xl font-display font-bold tracking-tight">Sales & Orders</h4>
                      <p className="text-xs text-surface-300 font-medium">B2B Bill management</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1.5 rounded-full text-surface-400">Locked</span>
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
      </main>

      {/* MODALS */}
      
      {/* Bulk Entry Sheet */}
      <BottomSheet isOpen={isBulkEntryOpen} onClose={closeSheet} title="Bulk Diary Entry">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
          <p className="text-surface-300 text-xs font-bold uppercase tracking-widest px-1">Quick-fill diary records</p>
          <div className="space-y-3">
            {bulkRows.map((row, idx) => (
              <div key={idx} className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_1fr_auto] gap-3 items-center bg-white border border-surface-100 p-4 rounded-2xl shadow-sm relative group">
                <button onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg sm:static sm:bg-transparent sm:text-red-300 sm:hover:text-red-500 sm:shadow-none transition-all"><X size={14} /></button>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 w-full sm:w-auto items-center sm:items-start">
                  <span className="text-[8px] font-black text-[#111111]/30 uppercase tracking-widest ml-1 min-w-[35px]">Date</span>
                  <input type="date" value={row.date} onChange={(e) => { const newRows = [...bulkRows]; newRows[idx].date = e.target.value; setBulkRows(newRows); }} className="bg-[#F5F5F5] rounded-lg px-2 py-2 text-[10px] font-bold outline-none border-none flex-1 sm:w-[90px]" />
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 w-full items-center sm:items-start">
                  <span className="text-[8px] font-black text-[#111111]/30 uppercase tracking-widest ml-1 min-w-[35px]">Pcs</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={row.pieces} 
                    onChange={(e) => {
                      const newRows = [...bulkRows];
                      newRows[idx].pieces = e.target.value;
                      setBulkRows(newRows);
                    }}
                    className="w-full bg-[#F5F5F5] rounded-lg p-3 sm:p-2 text-center text-xs font-bold outline-none border-none" 
                  />
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 w-full items-center sm:items-start">
                  <span className="text-[8px] font-black text-[#111111]/30 uppercase tracking-widest ml-1 min-w-[35px]">Rate</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={row.rate} 
                    onChange={(e) => {
                      const newRows = [...bulkRows];
                      newRows[idx].rate = e.target.value;
                      setBulkRows(newRows);
                    }}
                    className="w-full bg-[#F5F5F5] rounded-lg p-3 sm:p-2 text-center text-xs font-bold outline-none border-none" 
                  />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setBulkRows([...bulkRows, { date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }])} className="w-full py-4 border-2 border-dashed border-surface-200 rounded-3xl text-surface-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-50 transition-colors"><Plus size={16} /> Add Another Row</button>
          <div className="pt-4 sticky bottom-0 bg-white">
            <button onClick={handleBulkSubmit} className="w-full bg-[#111111] text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all mt-4 border border-[#D4AF37]/20">Save {bulkRows.filter(r => r.pieces && r.rate).length} Entries</button>
          </div>
        </div>
      </BottomSheet>

      {/* History Sheet */}
      <BottomSheet isOpen={isHistoryOpen} onClose={() => { closeSheet(); setViewingSettlement(null); }} title={viewingSettlement ? "Settlement Details" : "Payment History"}>
        {!viewingSettlement ? (
          <div className="space-y-4 pb-10">
            {getSettlements(activeWorker?.id).length === 0 && <p className="text-center py-20 text-surface-200 font-bold uppercase tracking-widest text-[10px]">No previous settlements</p>}
            {getSettlements(activeWorker?.id).map(s => (
              <div key={s.id} onClick={() => setViewingSettlement(s)} className="bg-white border border-surface-100 p-6 rounded-[2rem] shadow-sm flex justify-between items-center active:scale-95 transition-transform cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#111111] uppercase tracking-widest mb-1">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-[10px] text-surface-300 font-bold uppercase tracking-widest">{s.txIds.length} Transactions Settled</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-[#111111]">₹{s.amountPaid?.toLocaleString()}</p>
                  <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Paid Full</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 pb-10">
            <button onClick={() => setViewingSettlement(null)} className="flex items-center gap-2 text-surface-300 text-[10px] font-bold uppercase tracking-widest mb-4"><ArrowLeft size={14} /> Back to History</button>
            <div className="bg-[#F5F5F5] p-6 rounded-[2rem] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Total Paid</p>
                <h4 className="text-3xl font-display font-bold text-[#111111]">₹{viewingSettlement.amountPaid?.toLocaleString()}</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Items</p>
                <h4 className="text-xl font-display font-bold text-[#111111]">{viewingSettlement.txIds.length}</h4>
              </div>
            </div>
            <div className="space-y-2">
              {getSettlementTransactions(viewingSettlement.id).map(tx => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-surface-50 last:border-none">
                  <div>
                    <p className="text-xs font-bold text-[#111111] uppercase">{tx.type === 'work' ? 'Piece Work' : 'Advance'}</p>
                    <p className="text-[10px] text-surface-300 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#111111]">₹{tx.amount?.toLocaleString()}</p>
                    {tx.type === 'work' && <p className="text-[9px] text-surface-300">{tx.pieces} × {tx.rate}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => generateInvoicePDF(activeWorker, getSettlementTransactions(viewingSettlement.id), viewingSettlement.amountPaid)} className="w-full btn-secondary py-5 flex items-center justify-center gap-2 mt-6"><FileText size={18} /> Download PDF Voucher</button>
          </div>
        )}
      </BottomSheet>

      {/* Add Worker Modal */}
      <BottomSheet isOpen={isAddWorkerOpen} onClose={closeSheet} title="Register Professional">
        <form onSubmit={handleAddWorker} className="space-y-6 pb-10">
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
            <input type="text" required value={newWorker.name} onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="Legal Name" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Contact Number</label>
            <input type="tel" required maxLength={10} value={newWorker.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setNewWorker({ ...newWorker, phone: val }); }} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="10 Digit Number" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Home Address</label>
            <textarea value={newWorker.address} onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none min-h-[120px] font-bold" placeholder="Detailed Address" />
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Initialize Profile</button>
        </form>
      </BottomSheet>

      {/* Add/Edit Single Transaction Modal */}
      <BottomSheet isOpen={isEditTxOpen || location.pathname.includes('/add-tx')} onClose={closeSheet} title={editingTx ? (editingTx.type === 'work' ? "Edit Work Log" : "Edit Advance") : "New Record"}>
        {!editingTx && (
          <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl mb-8">
            <button onClick={() => setNewTx({ ...newTx, type: 'work' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'work' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#111111]/30'}`}>Work Entry</button>
            <button onClick={() => setNewTx({ ...newTx, type: 'advance' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'advance' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#111111]/30'}`}>Advance</button>
          </div>
        )}
        <form onSubmit={handleAddTx} className="space-y-6 pb-10">
          {newTx.type === 'work' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3">Quantity</label>
                <input type="number" required value={newTx.pieces} onChange={(e) => setNewTx({ ...newTx, pieces: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold text-center" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3">Rate (₹)</label>
                <input type="number" required value={newTx.rate} onChange={(e) => setNewTx({ ...newTx, rate: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold text-center" placeholder="0.00" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3">Amount (₹)</label>
              <input type="number" required value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-3xl p-6 outline-none text-3xl font-display font-bold text-center" placeholder="0.00" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3">Transaction Date</label>
            <input type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" />
          </div>
          <div className="flex gap-3">
            {editingTx && (
              <button type="button" onClick={() => { handleDeleteTx(editingTx.id); closeSheet(); }} className="p-5 bg-red-50 text-red-600 rounded-2xl active:scale-95 transition-all">
                <Trash2 size={24} />
              </button>
            )}
            <button type="submit" className="flex-1 btn-primary py-5 shadow-premium uppercase tracking-widest font-black">
              {editingTx ? 'Update Entry' : 'Commit Record'}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Settlement Sheet */}
      <BottomSheet isOpen={isSettlementOpen} onClose={closeSheet} title="Final Pay Balance">
        <div className="space-y-8 pb-10">
          <div className="bg-[#111111] text-[#D4AF37] rounded-[2.5rem] p-10 text-center shadow-premium relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Total Amount Payable</p>
             <h3 className="text-6xl font-display font-bold tracking-tighter">₹{calculateBalance(transactions).toLocaleString()}</h3>
          </div>
          <div className="space-y-4 px-2">
            <div className="flex justify-between items-center py-4 border-b border-surface-100">
              <span className="text-[11px] font-bold text-surface-300 uppercase tracking-widest">Gross Earnings</span>
              <span className="text-lg font-display font-bold text-green-600">₹{transactions.filter(tx => tx.type === 'work' && tx.status === 'active').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-100">
              <span className="text-[11px] font-bold text-surface-300 uppercase tracking-widest">Deductions (Advances)</span>
              <span className="text-lg font-display font-bold text-red-600">₹{transactions.filter(tx => tx.type === 'advance' && tx.status === 'active').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="pt-4 space-y-4">
            <button onClick={() => handleSettle(calculateBalance(transactions))} className="w-full bg-[#111111] text-[#D4AF37] py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all">Confirm Payment & Close Balance</button>
            <button onClick={() => generateInvoicePDF(activeWorker, activeTransactions, calculateBalance(transactions))} className="w-full btn-secondary py-5 flex items-center justify-center gap-2 rounded-[2rem] font-bold"><FileText size={18} /> Generate Professional PDF</button>
          </div>
        </div>
      </BottomSheet>
      </div>
    </>
  );
}

export default App;
