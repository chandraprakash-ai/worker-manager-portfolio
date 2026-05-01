import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

export const InventoryModals = ({ 
  isAddInventoryOpen, closeSheet, handleAddInventory, newItem, setNewItem, 
  isUpdateInventoryOpen, activeInvItem, updateQty, setUpdateQty, handleInventoryUpdate 
}) => {
  return (
    <>
      {/* Add Inventory Modal */}
      <BottomSheet isOpen={isAddInventoryOpen} onClose={closeSheet} title="New Item Registration">
        <form onSubmit={handleAddInventory} className="space-y-6 pb-10">
          <div>
            <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Item Name</label>
            <input type="text" required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="e.g., Pure Silk Fabric" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold appearance-none">
                <option value="Fabric">Fabric</option>
                <option value="Threads">Threads</option>
                <option value="Buttons">Buttons</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Unit</label>
              <input type="text" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="meters, pcs, etc." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Initial Qty</label>
              <input type="number" required value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="0" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Min. Alert</label>
              <input type="number" required value={newItem.minThreshold} onChange={(e) => setNewItem({ ...newItem, minThreshold: e.target.value })} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold" placeholder="10" />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Initialize Stock</button>
        </form>
      </BottomSheet>

      {/* Update Inventory Sheet */}
      <BottomSheet isOpen={isUpdateInventoryOpen} onClose={closeSheet} title={activeInvItem?.name}>
        <div className="space-y-8 pb-10">
          <div className="flex justify-between items-center bg-[#F5F5F5] p-6 rounded-[2rem]">
            <div>
              <p className="text-[10px] font-bold text-surface-300 uppercase mb-1">Current Balance</p>
              <h4 className="text-3xl font-display font-bold text-[#111111]">{activeInvItem?.quantity} {activeInvItem?.unit}</h4>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full">{activeInvItem?.category}</span>
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-4 text-center">Amount to adjust</label>
             <div className="flex items-center justify-center gap-8">
               <button onClick={() => setUpdateQty(Math.max(0, updateQty - 1))} className="w-16 h-16 rounded-full border-2 border-surface-100 flex items-center justify-center text-[#111111] active:scale-90 transition-all"><Minus size={24} /></button>
               <input 
                 type="number" 
                 value={updateQty} 
                 onChange={(e) => setUpdateQty(Number(e.target.value))} 
                 className="w-32 bg-transparent text-5xl font-display font-bold text-center outline-none"
               />
               <button onClick={() => setUpdateQty(updateQty + 1)} className="w-16 h-16 rounded-full border-2 border-surface-100 flex items-center justify-center text-[#111111] active:scale-90 transition-all"><Plus size={24} /></button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <button 
               onClick={() => handleInventoryUpdate('add')}
               className="bg-[#111111] text-[#D4AF37] py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-premium flex items-center justify-center gap-2 active:scale-95 transition-all"
             >
               <Plus size={20} strokeWidth={3} /> Restock
             </button>
             <button 
               onClick={() => handleInventoryUpdate('use')}
               className="bg-white border-2 border-surface-100 text-[#111111] py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
             >
               <Minus size={20} strokeWidth={3} /> Record Usage
             </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
