import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, AlertTriangle, Package, Plus, Minus } from 'lucide-react';

export const InventoryDashboard = ({ 
  search, 
  setSearch, 
  allInventory, 
  onNavigate, 
  onOpenSheet, 
  setActiveInvItem 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/')} className="bg-[#111111] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"><Home size={18} /></button>
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

      <div className="grid grid-cols-1 gap-4">
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
                onClick={() => { setActiveInvItem(item); onOpenSheet(`/inventory/update/${item.id}`); }}
                className="bg-[#111111] text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-premium"
              >
                <Plus size={16} /> Restock
              </button>
              <button 
                onClick={() => { setActiveInvItem(item); onOpenSheet(`/inventory/update/${item.id}`); }}
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
        onClick={() => onOpenSheet('/inventory/add')} 
        className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};
