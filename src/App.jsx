import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { 
  LogOut, Plus, Search, ChevronRight, User, Phone, MapPin, 
  IndianRupee, FileText, CheckCircle2, Trash2, History, 
  Calendar, Layers, ArrowLeft
} from 'lucide-react';
import { BottomSheet } from './components/ui/BottomSheet';
import { haptic } from './utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { generateInvoicePDF } from './utils/generateInvoice';

function App() {
  const { user, login, logout } = useAuthStore();
  const { 
    workers, transactions, fetchWorkers, addWorker, addTransaction, 
    settleWorker, fetchTransactions, addBulkTransactions, getSettlements, 
    getSettlementTransactions 
  } = useDataStore();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [search, setSearch] = useState('');
  
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingSettlement, setViewingSettlement] = useState(null);

  // Form states
  const [newWorker, setNewWorker] = useState({ name: '', phone: '', address: '' });
  const [newTx, setNewTx] = useState({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [bulkRows, setBulkRows] = useState([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
  const lastRowRef = useRef(null);

  useEffect(() => {
    if (isBulkEntryOpen && lastRowRef.current) {
      lastRowRef.current.focus();
    }
  }, [bulkRows.length]);

  useEffect(() => {
    if (user) {
      fetchWorkers();
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, pin);
    if (success) haptic('medium');
    else haptic('error');
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newWorker.phone)) {
      haptic('error');
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    try {
      await addWorker(newWorker);
      setNewWorker({ name: '', phone: '', address: '' });
      setIsAddWorkerOpen(false);
      haptic('medium');
    } catch (err) {
      haptic('error');
      alert(`Error saving profile: ${err.message}`);
    }
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    const amount = newTx.type === 'work' ? (parseFloat(newTx.pieces) * parseFloat(newTx.rate)) : parseFloat(newTx.amount);
    if (isNaN(amount) || amount <= 0) {
      haptic('error');
      alert("Please enter valid positive numbers.");
      return;
    }
    try {
      await addTransaction({ workerId: selectedWorker.id, ...newTx, amount });
      setNewTx({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setIsAddTxOpen(false);
      haptic('medium');
      fetchTransactions(selectedWorker.id);
    } catch (err) {
      haptic('error');
      alert(`Failed to add transaction: ${err.message}`);
    }
  };

  const handleBulkSubmit = async () => {
    const validRows = bulkRows.filter(row => row.pieces && row.rate);
    if (validRows.length === 0) {
      haptic('error');
      alert("Please fill at least one row with pieces and rate.");
      return;
    }

    try {
      const txs = validRows.map(row => ({
        workerId: selectedWorker.id,
        type: 'work',
        date: row.date,
        pieces: parseFloat(row.pieces),
        rate: parseFloat(row.rate),
        amount: parseFloat(row.pieces) * parseFloat(row.rate)
      }));

      await addBulkTransactions(txs);
      setBulkRows([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
      setIsBulkEntryOpen(false);
      haptic('heavy');
      fetchTransactions(selectedWorker.id);
    } catch (err) {
      haptic('error');
      alert(`Bulk entry failed: ${err.message}`);
    }
  };

  const handleSettle = async (balance) => {
    try {
      await settleWorker(selectedWorker.id, balance);
      setIsSettlementOpen(false);
      haptic('heavy');
      fetchTransactions(selectedWorker.id);
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
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-display font-bold text-brand mb-2 tracking-tight">AMRUT FASHION</h1>
            <p className="text-surface-300 font-medium tracking-[0.2em] text-[10px] uppercase">Crafting Excellence Since 1998</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-medium" placeholder="Manager ID" />
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-medium" placeholder="Security PIN" />
            <button type="submit" className="w-full btn-primary py-5 text-lg shadow-premium">Authorize Session</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-brand-light pb-24 font-sans no-print">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-surface-100 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand text-brand-accent rounded-xl flex items-center justify-center font-bold text-xl">A</div>
          <div>
            <h1 className="text-sm font-display font-bold text-brand tracking-wider">AMRUT FASHION</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-surface-300 font-bold uppercase tracking-tighter">Live Session</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-surface-50 rounded-2xl text-brand/40 active:scale-90 transition-all"><LogOut size={20} /></button>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        {!selectedWorker ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl text-brand font-display font-bold">Personnel</h2>
              <button onClick={() => { haptic(); setIsAddWorkerOpen(true); }} className="bg-brand text-white p-4 rounded-2xl shadow-premium active:scale-95 transition-all"><Plus size={24} /></button>
            </div>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-accent transition-colors" size={20} />
              <input type="text" placeholder="Search by name or number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-surface-100 rounded-3xl py-5 pl-14 pr-6 shadow-sm focus:shadow-premium focus:border-brand-accent/30 outline-none transition-all font-medium" />
            </div>
            <div className="grid gap-4">
              {filteredWorkers.map(worker => (
                <motion.div key={worker.id} whileTap={{ scale: 0.97 }} onClick={async () => { haptic(); setSelectedWorker(worker); await fetchTransactions(worker.id); }} className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand/80 rounded-2xl flex items-center justify-center text-brand-accent font-bold text-xl shadow-inner">{worker.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-brand leading-tight">{worker.name}</h3>
                      <p className="text-xs text-surface-300 font-bold tracking-widest mt-1 uppercase">{worker.phone}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-surface-200" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <button onClick={() => setSelectedWorker(null)} className="text-surface-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-2 bg-white px-4 py-2 rounded-full shadow-sm"><ArrowLeft size={14} /> Back to Directory</button>

            <div className="bg-brand text-white p-6 rounded-[2.5rem] shadow-premium relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-1">{selectedWorker.name}</h2>
                  <div className="flex gap-3 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Phone size={10} className="text-brand-accent" /> {selectedWorker.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={10} className="text-brand-accent" /> {selectedWorker.address?.slice(0, 15) || 'No Address'}...</span>
                  </div>
                </div>
                <button onClick={() => setIsHistoryOpen(true)} className="bg-white/10 backdrop-blur-xl p-2.5 rounded-xl border border-white/5 text-brand-accent">
                  <History size={20} />
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-5 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-brand-accent text-[8px] uppercase tracking-[0.2em] font-black mb-1 opacity-80">Payable Balance</p>
                  <h4 className="text-3xl font-display font-bold">₹{calculateBalance(transactions).toLocaleString()}</h4>
                </div>
                <div className="text-right">
                  <span className="bg-white/10 text-white/40 text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-tighter">Active View</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => { haptic(); setIsAddTxOpen(true); }} className="bg-white border border-surface-100 p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"><Plus size={24} className="text-brand" /><span className="text-[10px] font-black uppercase tracking-tighter text-brand/60">Single</span></button>
              <button onClick={() => { haptic(); setIsBulkEntryOpen(true); }} className="bg-brand-accent/10 border border-brand-accent/20 p-5 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all"><Layers size={24} className="text-brand-accent" /><span className="text-[10px] font-black uppercase tracking-tighter text-brand-accent">Bulk Entry</span></button>
              <button onClick={() => { haptic('medium'); setIsSettlementOpen(true); }} className="bg-brand text-white p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-premium active:scale-95 transition-all"><IndianRupee size={24} /><span className="text-[10px] font-black uppercase tracking-tighter text-white/80">Settle</span></button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-display font-bold text-brand">Recent Work</h3>
                <span className="text-surface-300 text-[9px] font-bold uppercase tracking-widest">{activeTransactions.length} items</span>
              </div>
              <div className="space-y-3">
                {activeTransactions.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-surface-100 rounded-[2rem] py-12 text-center">
                    <p className="text-surface-200 font-bold uppercase tracking-widest text-[10px]">No Active Transactions</p>
                  </div>
                )}
                {activeTransactions.map(tx => (
                  <div key={tx.id} className="bg-white p-6 rounded-3xl border border-surface-100 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'work' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'work' ? <CheckCircle2 size={22} /> : <IndianRupee size={22} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-brand uppercase tracking-tight">{tx.type === 'work' ? 'Work Log' : 'Advance'}</p>
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
      </main>

      {/* MODALS */}
      
      {/* Bulk Entry Sheet */}
      <BottomSheet isOpen={isBulkEntryOpen} onClose={() => setIsBulkEntryOpen(false)} title="Bulk Diary Entry">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
          <p className="text-surface-300 text-xs font-bold uppercase tracking-widest px-1">Quick-fill diary records</p>
          <div className="space-y-3">
            {bulkRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center bg-white border border-surface-100 p-4 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-brand/30 uppercase tracking-widest ml-1">Date</span>
                  <input type="date" value={row.date} onChange={(e) => { const newRows = [...bulkRows]; newRows[idx].date = e.target.value; setBulkRows(newRows); }} className="bg-brand-light rounded-lg px-2 py-2 text-[10px] font-bold outline-none border-none w-[90px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-brand/30 uppercase tracking-widest ml-1">Pieces</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    ref={idx === bulkRows.length - 1 ? lastRowRef : null}
                    value={row.pieces} 
                    onChange={(e) => { const newRows = [...bulkRows]; newRows[idx].pieces = e.target.value; setBulkRows(newRows); }} 
                    className="w-full bg-brand-light rounded-lg p-2 text-center text-xs font-bold outline-none border-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-brand/30 uppercase tracking-widest ml-1">Rate</span>
                  <input type="number" placeholder="0" value={row.rate} onChange={(e) => { const newRows = [...bulkRows]; newRows[idx].rate = e.target.value; setBulkRows(newRows); }} className="w-full bg-brand-light rounded-lg p-2 text-center text-xs font-bold outline-none border-none" />
                </div>
                <button onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))} className="mt-4 p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setBulkRows([...bulkRows, { date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }])} className="w-full py-4 border-2 border-dashed border-surface-200 rounded-3xl text-surface-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-50 transition-colors"><Plus size={16} /> Add Another Row</button>
          <div className="pt-4 sticky bottom-0 bg-white">
            <button onClick={handleBulkSubmit} className="w-full btn-primary py-5 text-lg shadow-premium">Save {bulkRows.filter(r => r.pieces && r.rate).length} Entries</button>
          </div>
        </div>
      </BottomSheet>

      {/* History Sheet */}
      <BottomSheet isOpen={isHistoryOpen} onClose={() => { setIsHistoryOpen(false); setViewingSettlement(null); }} title={viewingSettlement ? "Settlement Details" : "Payment History"}>
        {!viewingSettlement ? (
          <div className="space-y-4 pb-10">
            {getSettlements(selectedWorker?.id).length === 0 && <p className="text-center py-20 text-surface-200 font-bold uppercase tracking-widest text-[10px]">No previous settlements</p>}
            {getSettlements(selectedWorker?.id).map(s => (
              <div key={s.id} onClick={() => setViewingSettlement(s)} className="bg-white border border-surface-100 p-6 rounded-[2rem] shadow-sm flex justify-between items-center active:scale-95 transition-transform cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-brand uppercase tracking-widest mb-1">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-[10px] text-surface-300 font-bold uppercase tracking-widest">{s.txIds.length} Transactions Settled</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-brand">₹{s.amountPaid?.toLocaleString()}</p>
                  <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Paid Full</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 pb-10">
            <button onClick={() => setViewingSettlement(null)} className="flex items-center gap-2 text-surface-300 text-[10px] font-bold uppercase tracking-widest mb-4"><ArrowLeft size={14} /> Back to History</button>
            <div className="bg-brand-light p-6 rounded-[2rem] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Total Paid</p>
                <h4 className="text-3xl font-display font-bold text-brand">₹{viewingSettlement.amountPaid?.toLocaleString()}</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Items</p>
                <h4 className="text-xl font-display font-bold text-brand">{viewingSettlement.txIds.length}</h4>
              </div>
            </div>
            <div className="space-y-2">
              {getSettlementTransactions(viewingSettlement.id).map(tx => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-surface-50 last:border-none">
                  <div>
                    <p className="text-xs font-bold text-brand uppercase">{tx.type === 'work' ? 'Piece Work' : 'Advance'}</p>
                    <p className="text-[10px] text-surface-300 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand">₹{tx.amount?.toLocaleString()}</p>
                    {tx.type === 'work' && <p className="text-[9px] text-surface-300">{tx.pieces} × {tx.rate}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => generateInvoicePDF(selectedWorker, getSettlementTransactions(viewingSettlement.id), viewingSettlement.amountPaid)} className="w-full btn-secondary py-5 flex items-center justify-center gap-2 mt-6"><FileText size={18} /> Download PDF Voucher</button>
          </div>
        )}
      </BottomSheet>

      {/* Add Worker Modal */}
      <BottomSheet isOpen={isAddWorkerOpen} onClose={() => setIsAddWorkerOpen(false)} title="Register Professional">
        <form onSubmit={handleAddWorker} className="space-y-6 pb-10">
          <div>
            <label className="block text-[10px] font-black text-brand/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
            <input type="text" required value={newWorker.name} onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-bold" placeholder="Legal Name" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-brand/30 uppercase tracking-[0.2em] mb-3 ml-1">Contact Number</label>
            <input type="tel" required maxLength={10} value={newWorker.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setNewWorker({ ...newWorker, phone: val }); }} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-bold" placeholder="10 Digit Number" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-brand/30 uppercase tracking-[0.2em] mb-3 ml-1">Home Address</label>
            <textarea value={newWorker.address} onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none min-h-[120px] font-bold" placeholder="Detailed Address" />
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Initialize Profile</button>
        </form>
      </BottomSheet>

      {/* Add Single Transaction Modal */}
      <BottomSheet isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="New Record">
        <div className="flex bg-brand-light p-1.5 rounded-2xl mb-8">
          <button onClick={() => setNewTx({ ...newTx, type: 'work' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'work' ? 'bg-white text-brand shadow-sm' : 'text-brand/30'}`}>Work Entry</button>
          <button onClick={() => setNewTx({ ...newTx, type: 'advance' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'advance' ? 'bg-white text-brand shadow-sm' : 'text-brand/30'}`}>Advance</button>
        </div>
        <form onSubmit={handleAddTx} className="space-y-6 pb-10">
          {newTx.type === 'work' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-brand/30 uppercase tracking-widest mb-3">Quantity</label>
                <input type="number" required value={newTx.pieces} onChange={(e) => setNewTx({ ...newTx, pieces: e.target.value })} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-bold text-center" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-brand/30 uppercase tracking-widest mb-3">Rate (₹)</label>
                <input type="number" required value={newTx.rate} onChange={(e) => setNewTx({ ...newTx, rate: e.target.value })} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-bold text-center" placeholder="0.00" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-brand/30 uppercase tracking-widest mb-3">Amount (₹)</label>
              <input type="number" required value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="w-full bg-brand-light border-none rounded-3xl p-6 outline-none text-3xl font-display font-bold text-center" placeholder="0.00" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-brand/30 uppercase tracking-widest mb-3">Transaction Date</label>
            <input type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full bg-brand-light border-none rounded-2xl p-5 outline-none font-bold" />
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium uppercase tracking-widest font-black">Commit Record</button>
        </form>
      </BottomSheet>

      {/* Settlement Sheet */}
      <BottomSheet isOpen={isSettlementOpen} onClose={() => setIsSettlementOpen(false)} title="Final Pay Balance">
        <div className="space-y-8 pb-10">
          <div className="bg-brand text-brand-accent rounded-[2.5rem] p-10 text-center shadow-premium relative overflow-hidden">
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
            <button onClick={() => handleSettle(calculateBalance(transactions))} className="w-full bg-brand text-brand-accent py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all">Confirm Payment & Close Balance</button>
            <button onClick={() => generateInvoicePDF(selectedWorker, activeTransactions, calculateBalance(transactions))} className="w-full btn-secondary py-5 flex items-center justify-center gap-2 rounded-[2rem] font-bold"><FileText size={18} /> Generate Professional PDF</button>
          </div>
        </div>
      </BottomSheet>
      </div>
    </>
  );
}

export default App;
