import React from 'react';
import { X, Plus, CheckCircle2, IndianRupee, ArrowLeft, FileText } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

export const WorkerModals = ({ 
  isBulkEntryOpen, closeSheet, bulkRows, setBulkRows, handleBulkSubmit,
  isHistoryOpen, viewingSettlement, setViewingSettlement, getSettlements, activeWorker, getSettlementTransactions, generateInvoicePDF,
  isAddWorkerOpen, handleAddWorker, newWorker, setNewWorker,
  isEditTxOpen, editingTx, newTx, setNewTx, handleUpdateTransaction, deleteTransaction,
  isSettlementOpen, calculateBalance, transactions, handleSettle, activeTransactions
}) => {
  return (
    <>
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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black"><CheckCircle2 size={24} /></div>
                  <div>
                    <h4 className="text-lg font-display font-bold">₹{s.amountPaid?.toLocaleString()}</h4>
                    <p className="text-[10px] text-surface-300 font-bold uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <ArrowLeft size={16} className="text-surface-100 rotate-180" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            <button onClick={() => setViewingSettlement(null)} className="text-[10px] font-black text-surface-300 uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={12} /> Back to History</button>
            <div className="bg-[#F5F5F5] p-8 rounded-[2rem] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Paid to Worker</p>
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
            <input type="tel" required value={newWorker.phone} onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="+91 00000 00000" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Residential Address</label>
            <textarea value={newWorker.address} onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold min-h-[120px]" placeholder="Street, City, Pincode" />
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Complete Registration</button>
        </form>
      </BottomSheet>

      {/* Add/Edit Transaction Sheet */}
      <BottomSheet isOpen={isEditTxOpen} onClose={closeSheet} title={editingTx ? 'Update Ledger' : 'New Entry'}>
        <form onSubmit={handleUpdateTransaction} className="space-y-6 pb-10">
          <div className="grid grid-cols-2 gap-3 bg-surface-50 p-1.5 rounded-2xl">
            <button type="button" onClick={() => setNewTx({ ...newTx, type: 'work' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'work' ? 'bg-[#111111] text-[#D4AF37] shadow-lg' : 'text-[#111111]/40'}`}>Piece Work</button>
            <button type="button" onClick={() => setNewTx({ ...newTx, type: 'advance' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'advance' ? 'bg-[#111111] text-[#D4AF37] shadow-lg' : 'text-[#111111]/40'}`}>Advance</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Date of Entry</label>
              <input type="date" required value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" />
            </div>

            {newTx.type === 'work' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Quantity (Pcs)</label>
                  <input type="number" required value={newTx.pieces} onChange={(e) => setNewTx({ ...newTx, pieces: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Rate (₹)</label>
                  <input type="number" required value={newTx.rate} onChange={(e) => setNewTx({ ...newTx, rate: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="0.00" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Amount (₹)</label>
                <input type="number" required value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="0.00" />
              </div>
            )}
          </div>

          <div className="pt-4 space-y-4">
            {editingTx && (
              <button type="button" onClick={() => { if(confirm('Delete this entry?')) { deleteTransaction(editingTx.id); closeSheet(); } }} className="w-full text-red-500 font-bold text-xs uppercase tracking-widest py-2">Remove Record</button>
            )}
            <button type="submit" className="w-full bg-[#111111] text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all">
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
    </>
  );
};
