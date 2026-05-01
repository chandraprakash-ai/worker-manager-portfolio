import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ChevronRight, Users, Plus } from 'lucide-react';

export const WorkerDirectory = ({ search, setSearch, workers, onOpenSheet, onNavigate }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
         <button onClick={() => onNavigate('/')} className="text-[#111111]/40 hover:text-[#111111] transition-colors pr-2 active:scale-90"><ArrowLeft size={24} /></button>
         <h2 className="text-3xl text-[#111111] font-display font-black tracking-tight">Workers Directory</h2>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111111]/20" size={20} />
        <input 
          type="text" 
          placeholder="Search workers..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-white border border-surface-100 rounded-[1.5rem] py-5 pl-14 pr-6 shadow-sm focus:border-[#D4AF37]/30 outline-none transition-all font-medium" 
        />
      </div>

      <div className="grid gap-4 pb-12">
        {workers.map(worker => (
          <motion.div key={worker.id} whileTap={{ scale: 0.97 }} onClick={() => onOpenSheet(`/worker/${worker.id}`)} className="bg-white p-5 rounded-[1.5rem] border border-surface-50 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 flex-shrink-0 bg-[#111111] text-[#D4AF37] rounded-xl flex items-center justify-center font-black text-lg border border-[#D4AF37]/10 shadow-sm group-hover:scale-105 transition-transform">{worker.name.charAt(0)}</div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#111111] leading-tight truncate">{worker.name}</h3>
                <p className="text-[10px] text-[#111111]/30 font-black tracking-widest mt-0.5 uppercase">{worker.phone}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
          </motion.div>
        ))}
        {workers.length === 0 && (
          <div className="text-center py-10 opacity-30">
            <Users size={40} className="mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest">No workers found</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onOpenSheet('/add-worker')} 
        className="fixed bottom-8 right-8 z-[60] bg-[#111111] text-[#D4AF37] w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all border-2 border-[#D4AF37]/20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};
