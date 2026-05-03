import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Package, ClipboardList, BarChart3 } from 'lucide-react';

export const HomeDashboard = ({ navigate }) => {
  return (
    <div className="space-y-10">
      {/* Header Greeting */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.3em] mb-2">Workspace Dashboard</p>
          <h2 className="text-4xl font-display font-black text-[#111111] leading-tight">Welcome,<br/>Amrut Fashion</h2>
        </div>
        <div className="w-14 h-14 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]">
          <BarChart3 size={24} />
        </div>
      </div>

      {/* Main Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/workers')}
          className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20"
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"><Users size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight text-[#111111]">Workers</h4>
              <p className="text-xs text-surface-300 font-medium uppercase tracking-widest mt-1">Personnel & Ledger</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
        </motion.div>

        <div onClick={() => navigate('/lots')} className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"><ClipboardList size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight text-[#111111]">Production (Lots)</h4>
              <p className="text-xs text-surface-300 font-medium uppercase tracking-widest mt-1">Job cards & Batch tracking</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center opacity-40 grayscale pointer-events-none">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]/20 flex-shrink-0"><BarChart3 size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight text-[#111111]">Analytics AI</h4>
              <p className="text-xs text-surface-300 font-medium uppercase tracking-widest mt-1">Profit & Growth insights</p>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1.5 rounded-full text-surface-400">Locked</span>
        </div>
      </div>
    </div>
  );
};
