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
      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/workers')}
          className="bg-[#111111] text-white p-8 rounded-[2.5rem] shadow-premium flex justify-between items-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-[#D4AF37] text-[#111111] rounded-[1.5rem] flex items-center justify-center shadow-lg"><Users size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight">Personnel Ledger</h4>
              <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-widest mt-1">Worker Management</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/5 relative z-10"><ChevronRight size={20} className="text-[#D4AF37]" /></div>
        </motion.div>

        <div onClick={() => navigate('/inventory')} className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Package size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight">Inventory Control</h4>
              <p className="text-xs text-surface-300 font-medium">Stock & Raw materials</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
        </div>

        <div onClick={() => navigate('/lots')} className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center active:scale-95 transition-all cursor-pointer group hover:border-[#D4AF37]/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ClipboardList size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight">Production (Lots)</h4>
              <p className="text-xs text-surface-300 font-medium">Job cards & Batch tracking</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#111111]/10 group-hover:text-[#D4AF37] transition-colors" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-sm flex justify-between items-center opacity-40 grayscale pointer-events-none">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-[1.5rem] flex items-center justify-center text-[#111111]/20"><BarChart3 size={32} /></div>
            <div>
              <h4 className="text-2xl font-display font-bold tracking-tight">Analytics AI</h4>
              <p className="text-xs text-surface-300 font-medium">Profit & Growth insights</p>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1.5 rounded-full text-surface-400">Locked</span>
        </div>
      </div>
    </div>
  );
};
