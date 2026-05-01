import React from 'react';
import { Plus, Check, ClipboardList, Package } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

export const LotModals = ({ 
  isAddLotOpen, closeSheet, handleAddLot, newLot, setNewLot, 
  isLotDetailOpen, selectedLot, onUpdateProcess 
}) => {
  return (
    <>
      {/* Add Lot Sheet */}
      <BottomSheet isOpen={isAddLotOpen} onClose={closeSheet} title="Initialize Production Lot">
        <form onSubmit={handleAddLot} className="space-y-6 pb-10">
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Lot / Batch Number</label>
            <input type="text" required value={newLot.lotNumber} onChange={(e) => setNewLot({ ...newLot, lotNumber: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="e.g., AF-2024-001" />
          </div>
          
          <div className="space-y-4">
             <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1 text-center">Production Quantities</label>
             <div className="grid grid-cols-4 gap-3">
               {['M', 'L', 'XL', '2XL'].map(size => (
                 <div key={size}>
                    <p className="text-center text-[10px] font-black mb-2">{size}</p>
                    <input 
                      type="number" 
                      value={newLot.sizes[size]} 
                      onChange={(e) => setNewLot({ ...newLot, sizes: { ...newLot.sizes, [size]: e.target.value } })}
                      className="w-full bg-[#F5F5F5] rounded-xl p-3 text-center text-xs font-bold outline-none border-none"
                      placeholder="0"
                    />
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-[#D4AF37]/5 p-6 rounded-3xl border border-[#D4AF37]/10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-3">Lot Metadata</h4>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs font-bold text-[#111111]/60">
                 <span>Total Pieces</span>
                 <span>{Object.values(newLot.sizes).reduce((a, b) => Number(a) + Number(b), 0)} Pcs</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-[#111111]/60">
                 <span>Standard Process</span>
                 <span>8 Stages</span>
               </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Start Production</button>
        </form>
      </BottomSheet>

      {/* Lot Detail Matrix Sheet */}
      <BottomSheet isOpen={isLotDetailOpen} onClose={closeSheet} title={`Lot #${selectedLot?.lotNumber}`}>
        {selectedLot && (
          <div className="space-y-8 pb-10">
             <div className="grid grid-cols-4 gap-3">
               {Object.entries(selectedLot.sizes).map(([size, qty]) => (
                 <div key={size} className="bg-[#F5F5F5] p-3 rounded-2xl text-center border border-surface-100">
                    <p className="text-[10px] font-black text-[#111111]/30 uppercase mb-1">{size}</p>
                    <p className="text-lg font-display font-bold text-[#111111]">{qty}</p>
                 </div>
               ))}
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-surface-300">Production Pipeline</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{selectedLot.processes.filter(p => p.status === 'Done').length} / 8 Complete</span>
                </div>
                
                <div className="space-y-3">
                  {selectedLot.processes.map((proc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onUpdateProcess(selectedLot.id, idx, proc.status === 'Done' ? 'Pending' : 'Done')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${proc.status === 'Done' ? 'bg-green-50 border-green-100' : 'bg-white border-surface-100'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${proc.status === 'Done' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-[#F5F5F5] text-[#111111]/30'}`}>
                          {proc.status === 'Done' ? <Check size={20} /> : <ClipboardList size={20} />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${proc.status === 'Done' ? 'text-green-700' : 'text-[#111111]'}`}>{proc.name}</p>
                          <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">{proc.status}</p>
                        </div>
                      </div>
                      {proc.status !== 'Done' && <div className="w-8 h-8 rounded-full border-2 border-surface-50 flex items-center justify-center text-surface-100"><Plus size={16} /></div>}
                    </div>
                  ))}
                </div>
             </div>

             <button onClick={closeSheet} className="w-full bg-[#111111] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest">Close Dashboard</button>
          </div>
        )}
      </BottomSheet>
    </>
  );
};
