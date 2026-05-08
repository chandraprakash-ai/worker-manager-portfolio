import React from 'react';
import { X, Plus, CheckCircle2, IndianRupee, ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

export const WorkerModals = ({ 
  isBulkEntryOpen, closeSheet, bulkRows, setBulkRows, handleBulkSubmit,
  isHistoryOpen, viewingSettlement, setViewingSettlement, getSettlements, activeWorker, getSettlementTransactions, generateInvoicePDF,
  isAddWorkerOpen, isEditWorkerOpen, handleAddWorker, handleUpdateWorker, newWorker, setNewWorker,
  isEditTxOpen, editingTx, newTx, setNewTx, handleUpdateTransaction, deleteTransaction,
  isSettlementOpen, calculateBalance, transactions, handleSettle, activeTransactions
}) => {
  const [localError, setLocalError] = React.useState('');

  const localSubmit = () => {
    const incompleteIdx = bulkRows.findIndex(r => (r.pieces || r.rate) && (!r.pieces || !r.rate || Number(r.pieces) <= 0 || Number(r.rate) <= 0));
    if (incompleteIdx !== -1) {
      setLocalError(`Entry ${incompleteIdx + 1} is missing data`);
      const field = !bulkRows[incompleteIdx].pieces ? `bulk-pcs-${incompleteIdx}` : `bulk-rate-${incompleteIdx}`;
      document.getElementById(field)?.focus();
      return;
    }
    setLocalError('');
    handleBulkSubmit();
  };

  return (
    <>
      {/* Bulk Entry Sheet */}
      <BottomSheet 
        isOpen={isBulkEntryOpen} 
        onClose={closeSheet} 
        onBack={closeSheet} 
        title="Bulk Entry" 
        fullScreen 
        showHandle={false}
        headerExtra={
          <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
            {bulkRows.length} Active Entries
          </span>
        }
      >
        <div className="space-y-8 py-10">
          <div className="space-y-3">
            {bulkRows.map((row, idx) => (
              <div key={idx} className="group bg-white border border-[#111111]/5 p-4 pt-8 rounded-[1.5rem] shadow-sm hover:shadow-premium transition-all duration-300 relative animate-in zoom-in-95 duration-300">
                <span className="absolute top-3 left-5 text-[10px] font-black text-[#111111]/20 uppercase tracking-widest">#{idx + 1}</span>
                
                {bulkRows.length > 1 && (
                  <button 
                    onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))} 
                    className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 z-10"
                  >
                    <X size={12} />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {/* Date Input */}
                  <div className="space-y-1">
                    <label className="block text-[8px] md:text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Work Date</label>
                    <input 
                      type="date" 
                      value={row.date} 
                      onChange={(e) => { const newRows = [...bulkRows]; newRows[idx].date = e.target.value; setBulkRows(newRows); }} 
                      className="w-full bg-[#F5F5F5] rounded-xl py-3 px-2 md:p-4 text-[10px] md:text-xs font-black outline-none border-none focus:bg-[#111111] focus:text-white transition-all" 
                    />
                  </div>

                  {/* Pieces Input */}
                  <div className="space-y-1">
                    <label className="block text-[8px] md:text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Pcs Done</label>
                    <input 
                      id={`bulk-pcs-${idx}`}
                      type="number" 
                      placeholder="Qty" 
                      value={row.pieces} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!row.pieces || row.pieces <= 0) return;
                          document.getElementById(`bulk-rate-${idx}`)?.focus();
                        }
                      }}
                      onChange={(e) => {
                        const newRows = [...bulkRows];
                        newRows[idx].pieces = e.target.value;
                        setBulkRows(newRows);
                      }}
                      className="w-full bg-[#F5F5F5] rounded-xl py-3 px-2 md:p-4 text-center text-[10px] md:text-xs font-black outline-none border-none focus:bg-[#111111] focus:text-[#D4AF37] transition-all" 
                    />
                  </div>

                  {/* Rate Input */}
                  <div className="space-y-1">
                    <label className="block text-[8px] md:text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Rate</label>
                    <div className="flex items-center gap-2">
                      <input 
                        id={`bulk-rate-${idx}`}
                        type="number" 
                        placeholder="0" 
                        value={row.rate} 
                        onChange={(e) => {
                          const newRows = [...bulkRows];
                          newRows[idx].rate = e.target.value;
                          setBulkRows(newRows);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!row.rate || row.rate <= 0) {
                              setLocalError("Complete current entry first");
                              return;
                            }
                            setLocalError('');
                            if (idx === bulkRows.length - 1) {
                              setBulkRows([...bulkRows, { date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
                            }
                          }
                        }}
                        className="w-full bg-[#F5F5F5] rounded-xl py-3 px-2 md:p-4 text-center text-[10px] md:text-xs font-black outline-none border-none focus:bg-[#111111] focus:text-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            fullWidth 
            variant="dashed" 
            size="lg" 
            icon={Plus}
            onClick={() => {
              if (bulkRows.length === 0) {
                setBulkRows([{ date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
                setLocalError('');
                return;
              }
              const lastRow = bulkRows[bulkRows.length - 1];
              if (lastRow.pieces && lastRow.rate) {
                setBulkRows([...bulkRows, { date: new Date().toISOString().split('T')[0], pieces: '', rate: '' }]);
                setLocalError('');
                setTimeout(() => {
                  document.getElementById(`bulk-pcs-${bulkRows.length}`)?.focus();
                }, 10);
              } else {
                setLocalError("Complete the current row first");
                const field = !lastRow.pieces ? `bulk-pcs-${bulkRows.length - 1}` : `bulk-rate-${bulkRows.length - 1}`;
                document.getElementById(field)?.focus();
              }
            }}
          >
            {bulkRows.length === 0 ? 'Start Entering Work' : 'Add Another Entry'}
          </Button>

          <div className="pt-6 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 flex flex-col gap-3">
            {localError && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
                {localError}
              </p>
            )}
            <Button 
              fullWidth 
              variant="primary" 
              size="lg" 
              onClick={localSubmit}
            >
              Save All {bulkRows.filter(r => r.pieces && r.rate).length} Entries
            </Button>
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
            <button onClick={() => generateInvoicePDF(activeWorker, getSettlementTransactions(viewingSettlement.id), viewingSettlement.amountPaid)} className="w-full btn-secondary py-5 flex items-center justify-center gap-2 mt-6"><FileText size={18} /> Download PDF Invoice</button>
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
            <input type="tel" maxLength="10" value={newWorker.phone} onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="00000 00000" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Residential Address</label>
            <textarea value={newWorker.address} onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold min-h-[120px]" placeholder="Street, City, Pincode" />
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Complete Registration</button>
        </form>
      </BottomSheet>

      {/* Edit Worker Modal */}
      <BottomSheet isOpen={isEditWorkerOpen} onClose={closeSheet} title="Edit Professional">
        <form onSubmit={handleUpdateWorker} className="space-y-6 pb-10">
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
            <input type="text" required value={newWorker.name} onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="Legal Name" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Contact Number</label>
            <input type="tel" maxLength="10" value={newWorker.phone} onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="00000 00000" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-3 ml-1">Residential Address</label>
            <textarea value={newWorker.address} onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold min-h-[120px]" placeholder="Street, City, Pincode" />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all hover:bg-green-700">Update Profile</button>
        </form>
      </BottomSheet>

      {/* Add/Edit Transaction Sheet */}
      <BottomSheet isOpen={isEditTxOpen} onClose={closeSheet} title={editingTx ? 'Update Ledger' : 'New Entry'}>
        <form onSubmit={handleUpdateTransaction} className="space-y-6 pb-10">
          <div className="grid grid-cols-2 gap-0 bg-surface-100 p-1.5 rounded-2xl relative overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ x: newTx.type === 'work' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-[#111111] rounded-xl shadow-premium"
            />
            
            <button 
              type="button" 
              onClick={() => setNewTx({ ...newTx, type: 'work' })} 
              className={`relative z-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${newTx.type === 'work' ? 'text-[#D4AF37]' : 'text-[#111111]/30'}`}
            >
              Piece Work
            </button>
            <button 
              type="button" 
              onClick={() => setNewTx({ ...newTx, type: 'advance' })} 
              className={`relative z-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${newTx.type === 'advance' ? 'text-[#D4AF37]' : 'text-[#111111]/30'}`}
            >
              Advance
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Date of Entry</label>
              <input type="date" required value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 pr-10 outline-none font-bold" />
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
            <button type="submit" className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all hover:bg-green-700">
              {editingTx ? 'Update Entry' : 'Commit Record'}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Settlement Sheet */}
      <BottomSheet isOpen={isSettlementOpen} onClose={closeSheet} title="Worker Settlement">
        <div className="space-y-8 pb-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 px-2">
              <div className="bg-[#F5F5F5] rounded-3xl p-6 border border-[#111111]/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#111111]/30 mb-2">Total Earnings</p>
                <h4 className="text-xl font-display font-bold text-green-600">₹{transactions.filter(tx => tx.type === 'work' && tx.status === 'active').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}</h4>
              </div>
              <div className="bg-[#F5F5F5] rounded-3xl p-6 border border-[#111111]/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#111111]/30 mb-2">Total Advance</p>
                <h4 className="text-xl font-display font-bold text-red-600">₹{transactions.filter(tx => tx.type === 'advance' && tx.status === 'active').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}</h4>
              </div>
            </div>

            <div className="mx-2 bg-[#111111] rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-2">Final Balance to Pay</p>
              <h3 className="text-5xl font-display font-bold text-white tracking-tighter">₹{calculateBalance(transactions).toLocaleString()}</h3>
            </div>
          </div>

          <div className="space-y-4 pt-4 px-2">
            <Button 
              fullWidth 
              variant="primary" 
              size="md" 
              icon={CheckCircle2}
              onClick={() => handleSettle(calculateBalance(transactions))}
            >
              Confirm and Settle
            </Button>
            
            <Button 
              fullWidth 
              variant="grey" 
              size="md" 
              icon={FileText}
              onClick={() => generateInvoicePDF(activeWorker, activeTransactions, calculateBalance(transactions))}
            >
              Generate Statement PDF
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
