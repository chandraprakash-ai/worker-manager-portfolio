import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, ClipboardList, TrendingUp, 
  ArrowRight, Hash, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const HomeDashboard = ({ workers, lots, transactions, navigate }) => {
  const { t, i18n } = useTranslation();
  // --- ANALYTICS CALCULATIONS ---
  const activeLots = (lots || []).filter(l => l.status === 'active');
  
  const ks4uLots = (lots || []).filter(l => l.brand === 'KS4U');
  const rktLots = (lots || []).filter(l => l.brand === 'RKT');

  // New Analytics Calculations
  const clearedLotsCount = (lots || []).filter(l => l.status === 'cleared').length;

  const activeLotsPieces = activeLots.reduce((sum, lot) => {
    const basePcs = Object.values(lot.sizes || {}).reduce((s, q) => s + (Number(q) || 0), 0);
    const numColors = Number(lot.numColors) || 1;
    return sum + (basePcs * numColors);
  }, 0);

  const avgActiveLotSize = activeLots.length > 0 
    ? Math.round(activeLotsPieces / activeLots.length) 
    : 0;

  const activeColorsCount = activeLots.reduce((sum, lot) => sum + (Number(lot.numColors) || 1), 0);

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
          <p className={`font-black text-[#111111]/30 uppercase tracking-[0.3em] mb-2 ${i18n.language === 'hi' ? 'text-[12px]' : 'text-[10px]'}`}>Amrut Fashion</p>
          <h2 className="text-4xl font-display font-black text-[#111111] leading-tight whitespace-pre-line">{t('dashboard.title')}</h2>
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
                  <p className={`font-black uppercase text-[#D4AF37] tracking-[0.4em] mb-3 ${i18n.language === 'hi' ? 'text-[13px] tracking-normal' : 'text-[10px]'}`}>{t('dashboard.live_status')}</p>
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
                  <p className={`font-black uppercase text-white/20 tracking-widest mb-1 ${i18n.language === 'hi' ? 'text-[11px] tracking-normal' : 'text-[8px]'}`}>{t('dashboard.design_code')}</p>
                  <p className="text-sm font-black text-white tracking-wide">{currentLot.designNo}</p>
               </div>
               <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className={`font-black uppercase text-white/20 tracking-widest mb-1 ${i18n.language === 'hi' ? 'text-[11px] tracking-normal' : 'text-[8px]'}`}>{t('dashboard.batch_status')}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-black text-green-400">{t('dashboard.processing')}</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
        {/* Card 1: Unified Brand Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[3rem] border border-surface-100 shadow-premium md:col-span-2"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <ClipboardList size={20} />
            </div>
            <span className={`font-black uppercase tracking-[0.2em] text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[13px] tracking-normal' : 'text-[10px]'}`}>{t('dashboard.production_volume')}</span>
          </div>

          <div className="space-y-4">
             {/* Header Row */}
             <div className="grid grid-cols-3 text-right text-[10px] font-black uppercase tracking-widest text-[#111111]/30 pb-2.5 border-b border-[#111111]/5">
                <div className="text-left">{t('dashboard.metric', 'Metric')}</div>
                <div>KS4U</div>
                <div>RKT</div>
             </div>

             {/* Total Row */}
             <div className="grid grid-cols-3 items-center text-right py-2.5 border-b border-[#111111]/5">
                <div className="text-left text-[10px] font-black uppercase tracking-widest text-[#111111]/40">{t('dashboard.total', 'Total')}</div>
                <div className="text-2xl font-display font-black text-[#111111]">{ks4uLots.length}</div>
                <div className="text-2xl font-display font-black text-[#111111]">{rktLots.length}</div>
             </div>

             {/* Active Row */}
             <div className="grid grid-cols-3 items-center text-right py-2.5 border-b border-[#111111]/5">
                <div className="text-left text-[10px] font-black uppercase tracking-widest text-amber-600">{t('dashboard.active', 'Active')}</div>
                <div className="text-2xl font-display font-black text-amber-600">{ks4uLots.filter(l => l.status === 'active').length}</div>
                <div className="text-2xl font-display font-black text-green-600">{rktLots.filter(l => l.status === 'active').length}</div>
             </div>

             {/* Cleared Row */}
             <div className="grid grid-cols-3 items-center text-right py-2.5">
                <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{t('common.cleared', 'Cleared')}</div>
                <div className="text-2xl font-display font-black text-gray-400">{ks4uLots.filter(l => l.status === 'cleared').length}</div>
                <div className="text-2xl font-display font-black text-gray-400">{rktLots.filter(l => l.status === 'cleared').length}</div>
             </div>
          </div>
        </motion.div>

        {/* Card 2: Pieces in Pipeline */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-8 rounded-[3rem] border border-surface-100 shadow-premium flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={20} />
            </div>
            <span className={`font-black uppercase tracking-[0.2em] text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[13px] tracking-normal' : 'text-[10px]'}`}>
              {t('dashboard.total_pieces', 'Pieces in Pipeline')}
            </span>
          </div>
          <div className="space-y-1 mt-auto">
            <h4 className="text-4xl font-display font-black text-[#111111] tracking-tight">
              {activeLotsPieces.toLocaleString()}
            </h4>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              {t('dashboard.across_lots', 'Across active production cycles')}
            </p>
          </div>
        </motion.div>

        {/* Card 4: Finished Pipeline */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white p-8 rounded-[3rem] border border-surface-100 shadow-premium flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ClipboardList size={20} />
            </div>
            <span className={`font-black uppercase tracking-[0.2em] text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[13px] tracking-normal' : 'text-[10px]'}`}>
              {t('dashboard.completed_lots', 'Completed Pipeline')}
            </span>
          </div>
          <div className="space-y-1 mt-auto">
            <h4 className="text-4xl font-display font-black text-emerald-600 tracking-tight">
              {clearedLotsCount}
            </h4>
            <p className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-widest">
              {t('dashboard.lots_finished', 'Finished Lots Archived')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
