import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Layout, ClipboardList, Plus } from 'lucide-react';

export const LotDashboard = ({ 
  search, 
  setSearch, 
  allLots, 
  onNavigate, 
  onOpenSheet, 
  setSelectedLot 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('/')} className="bg-[#111111] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all"><Home size={18} /></button>
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
            onClick={() => { setSelectedLot(lot); onOpenSheet(`/lot/${lot.id}`); }}
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
        onClick={() => onOpenSheet('/lot/add')} 
        className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};
