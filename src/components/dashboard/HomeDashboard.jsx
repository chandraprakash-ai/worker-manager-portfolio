import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, ClipboardList, TrendingUp, 
  ArrowRight, Hash, Layers
} from 'lucide-react';

export const HomeDashboard = ({ workers, lots, transactions, navigate }) => {
  // --- ANALYTICS CALCULATIONS ---
  const activeLots = (lots || []).filter(l => l.status === 'active');
  
  const ks4uLots = (lots || []).filter(l => l.brand === 'KS4U');
  const rktLots = (lots || []).filter(l => l.brand === 'RKT');

  // Get current (most recent) active lot
  const currentLot = [...activeLots].sort((a, b) => {
    const dateA = a.date?.seconds || 0;
    const dateB = b.date?.seconds || 0;
    return dateB - dateA;
  })[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const activeWorkersToday = new Set(
    (transactions || [])
      .filter(tx => tx.date === todayStr)
      .map(tx => tx.workerId)
  ).size;

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.3em] mb-2">Amrut Fashion</p>
          <h2 className="text-4xl font-display font-black text-[#111111] leading-tight">Production<br/>Command</h2>
        </div>
        <div className="w-12 h-12 bg-[#F5F5F5] rounded-[1.2rem] flex items-center justify-center text-[#111111]/20">
          <Layers size={20} />
        </div>
      </div>

      {/* Hero: Current Lot Card */}
      {currentLot && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/lot/${currentLot.id}`)}
          className="bg-[#111111] p-8 rounded-[3rem] shadow-premium group cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
        >
          {/* Background Accent */}
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
             <Package size={120} strokeWidth={1} className="text-[#D4AF37]" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black uppercase text-[#D4AF37] tracking-[0.4em] mb-3">Live in Production</p>
                  <h3 className="text-4xl font-display font-black text-white tracking-tighter leading-none flex items-center gap-3">
                    {currentLot.brand} 
                    <span className="text-[#D4AF37] flex items-center">
                      <Hash size={24} strokeWidth={3} />
                      {currentLot.lotNumber}
                    </span>
                  </h3>
               </div>
               <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#111111] transition-all">
                  <ArrowRight size={20} />
               </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Design Code</p>
                  <p className="text-sm font-black text-white tracking-wide">{currentLot.designNo}</p>
               </div>
               <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Batch Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-black text-green-400">Processing</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Unified Brand Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[3rem] border border-surface-100 shadow-premium"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
               <ClipboardList size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/30">Production Volume</span>
          </div>

          <div className="grid grid-cols-2 gap-8 relative">
             {/* Divider */}
             <div className="absolute top-2 bottom-2 left-1/2 w-px bg-[#111111]/5" />

             <div>
                <p className="text-[9px] font-black uppercase text-[#111111]/20 tracking-widest mb-2">KS4U Brand</p>
                <div className="flex items-end gap-2">
                   <h4 className="text-4xl font-display font-black text-[#111111] leading-none">{ks4uLots.length}</h4>
                   <span className="text-[10px] font-bold text-amber-600 mb-1">{ks4uLots.filter(l => l.status === 'active').length} Active</span>
                </div>
             </div>

             <div className="pl-4">
                <p className="text-[9px] font-black uppercase text-[#111111]/20 tracking-widest mb-2">RKT Brand</p>
                <div className="flex items-end gap-2">
                   <h4 className="text-4xl font-display font-black text-[#111111] leading-none">{rktLots.length}</h4>
                   <span className="text-[10px] font-bold text-green-600 mb-1">{rktLots.filter(l => l.status === 'active').length} Active</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Worker Card at Last */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[3rem] border border-surface-100 shadow-premium flex items-center justify-between group"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <Users size={28} />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase text-[#111111]/20 tracking-widest mb-1">Workforce Presence</p>
               <h4 className="text-3xl font-display font-black text-[#111111] leading-none">
                 {workers?.length || 0} <span className="text-sm font-black text-blue-600/40 ml-2">Registered</span>
               </h4>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-blue-50 rounded-xl">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{activeWorkersToday} Active Today</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
