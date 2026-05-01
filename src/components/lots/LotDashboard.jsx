import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Layout, ClipboardList, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LotDashboard = ({ 
  search, 
  setSearch, 
  allLots, 
  onNavigate, 
  onOpenSheet 
}) => {
  const getProgress = (lot) => {
    const done = lot.processes.filter(p => p.isDone).length;
    return (done / lot.processes.length) * 100;
  };

  const hasLoss = (lot) => {
    for (let i = 1; i < lot.processes.length; i++) {
      if (lot.processes[i].pieces > 0 && lot.processes[i].pieces < lot.processes[i-1].pieces) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('/')} className="text-[#111111]/40 hover:text-[#111111] transition-colors pr-2 active:scale-90"><ArrowLeft size={24} /></button>
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

      <div className="grid grid-cols-1 gap-4">
        {allLots.filter(l => l.lotNumber.toLowerCase().includes(search.toLowerCase())).map(lot => (
          <motion.div 
            key={lot.id} 
            onClick={() => onOpenSheet(`/lot/${lot.id}`)}
            className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer group hover:shadow-lg transition-all duration-300"
          >
            <div className="flex h-32">
              {/* Left: Compact Image Section */}
              <div className="w-32 bg-[#111111] relative overflow-hidden flex items-center justify-center text-white/5 flex-shrink-0">
                {lot.itemImage ? (
                  <img src={lot.itemImage} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <Layout size={32} className="opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]/40" />
              </div>

              {/* Right: Essential Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{lot.brand || 'KS4U'}</span>
                        <span className="text-[10px] font-bold text-[#111111]">Lot #{lot.lotNumber}</span>
                      </div>
                      <p className="text-[8px] font-black text-[#111111]/30 uppercase tracking-tighter">
                        {lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    {hasLoss(lot) && (
                      <div className="bg-red-50 p-1.5 rounded-lg text-red-500 animate-pulse">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3">
                    {Object.entries(lot.sizes).map(([size, qty]) => (
                      <div key={size} className="flex-shrink-0 bg-surface-50 border border-surface-100 px-2 py-1 rounded-lg text-center min-w-[35px]">
                        <p className="text-[7px] font-black text-[#111111]/30 uppercase">{size}</p>
                        <p className="text-[10px] font-bold text-[#111111]">{qty}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#111111]/40">Production Progress</p>
                    <p className="text-[9px] font-black text-[#111111]">{Math.round(getProgress(lot))}%</p>
                  </div>
                  <div className="h-1 w-full bg-surface-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(lot)}%` }}
                      className="h-full bg-[#111111] rounded-full shadow-sm"
                    />
                  </div>
                  <div className="flex -space-x-2.5 mt-2">
                     {lot.processes.map((p, i) => (
                       <div key={i} className={`w-9 h-9 rounded-full border-[3px] border-white flex items-center justify-center text-[9px] font-black transition-all ${p.isDone ? 'bg-[#D4AF37] text-[#111111] shadow-lg scale-110 z-10' : 'bg-surface-100 text-surface-300'}`}>
                         {p.isDone ? <CheckCircle2 size={14} /> : p.name.charAt(0)}
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {allLots.length === 0 && (
          <div className="text-center py-24 opacity-20">
            <ClipboardList size={72} strokeWidth={1} className="mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">No production activity recorded</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => onOpenSheet('/lot/add')} 
        className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-18 h-18 rounded-[1.75rem] shadow-premium flex items-center justify-center active:scale-95 hover:scale-105 transition-all border-2 border-[#D4AF37]/20 group"
      >
        <Plus size={36} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
};
