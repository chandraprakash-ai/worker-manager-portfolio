import React from 'react';
import { ArrowLeft, Phone, MapPin, History, Plus, Layers, IndianRupee, CheckCircle2, Calendar, FileText, Edit2 } from 'lucide-react';

export const WorkerDetail = ({ 
  activeWorker, 
  transactions, 
  calculateBalance, 
  onNavigate, 
  onOpenSheet, 
  setEditingTx, 
  setNewTx, 
  setNewWorker,
  generateInvoicePDF 
}) => {
  if (!activeWorker) return null;

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1 md:px-0">
      {/* Refined Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => onNavigate('/workers')} className="text-[#111111]/40 hover:text-[#111111] transition-all active:scale-90"><ArrowLeft size={24} /></button>
        <h2 className="text-xl md:text-3xl font-display font-black text-[#111111]">Worker Profile</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-[#111111] text-white p-4 md:p-10 rounded-[2.5rem] shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 space-y-5 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-4xl font-display font-black text-white tracking-tight leading-none">{activeWorker.name}</h2>
                <button 
                  onClick={() => {
                    setNewWorker({ name: activeWorker.name, phone: activeWorker.phone || '', address: activeWorker.address || '' });
                    onOpenSheet(`/worker/${activeWorker.id}/edit-worker`);
                  }} 
                  className="text-white/20 hover:text-[#D4AF37] transition-colors active:scale-95"
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="flex items-baseline gap-1.5 bg-[#D4AF37] text-[#111111] px-4 py-2 rounded-2xl shadow-xl flex-shrink-0">
                <p className="text-lg md:text-2xl font-display font-black tracking-tighter">₹{calculateBalance(transactions).toLocaleString()}</p>
                <span className="text-[8px] font-black uppercase">Due</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 opacity-60">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><Phone size={10} className="text-[#D4AF37]" /> {activeWorker.phone}</span>
              <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><MapPin size={10} className="text-[#D4AF37]" /> {activeWorker.address?.slice(0, 20) || 'No Address'}...</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => onOpenSheet(`/worker/${activeWorker.id}/history`)} 
              className="bg-white/5 hover:bg-white/10 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/5 text-[#D4AF37] transition-all flex items-center gap-3 active:scale-95 w-fit"
            >
              <History size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">View Full History</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => { setEditingTx(null); setNewTx({ type: 'work', pieces: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0] }); onOpenSheet(`/worker/${activeWorker.id}/add-tx`); }} className="bg-white border border-surface-100 p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"><Plus size={24} className="text-[#111111]" /><span className="text-[10px] font-black uppercase tracking-tighter text-[#111111]/60">Single</span></button>
        <button onClick={() => onOpenSheet(`/worker/${activeWorker.id}/bulk`)} className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-5 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all"><Layers size={24} className="text-[#D4AF37]" /><span className="text-[10px] font-black uppercase tracking-tighter text-[#D4AF37]">Bulk Entry</span></button>
        <button onClick={() => onOpenSheet(`/worker/${activeWorker.id}/settle`)} className="bg-[#111111] text-white p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-premium active:scale-95 transition-all"><IndianRupee size={24} /><span className="text-[10px] font-black uppercase tracking-tighter text-white/80">Settle</span></button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-display font-bold text-[#111111]">Recent Work</h3>
          <span className="text-surface-300 text-[9px] font-bold uppercase tracking-widest">{transactions.length} items</span>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 && (
            <div className="bg-white/50 border-2 border-dashed border-surface-100 rounded-[2rem] py-12 text-center">
              <p className="text-surface-200 font-bold uppercase tracking-widest text-[10px]">No Active Transactions</p>
            </div>
          )}
          {transactions.map(tx => (
            <div 
              key={tx.id} 
              onClick={() => {
                setEditingTx(tx);
                setNewTx({ ...tx, date: tx.date.split('T')[0] });
                onOpenSheet(`/worker/${activeWorker.id}/edit-tx/${tx.id}`);
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
  );
};
