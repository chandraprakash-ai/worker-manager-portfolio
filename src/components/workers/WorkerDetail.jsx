import React from 'react';
import { ArrowLeft, Phone, MapPin, History, Plus, Layers, IndianRupee, CheckCircle2, Calendar, FileText } from 'lucide-react';

export const WorkerDetail = ({ 
  activeWorker, 
  transactions, 
  calculateBalance, 
  onNavigate, 
  onOpenSheet, 
  setEditingTx, 
  setNewTx, 
  generateInvoicePDF 
}) => {
  if (!activeWorker) return null;

  return (
    <div className="space-y-8">
      <button onClick={() => onNavigate('/workers')} className="text-[#111111]/30 font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 mb-2 bg-white px-5 py-2.5 rounded-xl border border-surface-100 shadow-sm active:scale-95 transition-all"><ArrowLeft size={12} className="text-[#D4AF37]" /> Back to Workers</button>

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
          <button onClick={() => onOpenSheet(`/worker/${activeWorker.id}/history`)} className="bg-white/10 backdrop-blur-xl p-2.5 rounded-xl border border-white/5 text-[#D4AF37]">
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
        <button onClick={() => onOpenSheet(`/worker/${activeWorker.id}/add-tx`)} className="bg-white border border-surface-100 p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"><Plus size={24} className="text-[#111111]" /><span className="text-[10px] font-black uppercase tracking-tighter text-[#111111]/60">Single</span></button>
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
