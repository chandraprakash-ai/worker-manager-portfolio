import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Layout, ClipboardList, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';

export const LotDashboard = ({ 
  search, 
  setSearch, 
  allLots, 
  onNavigate, 
  onOpenSheet 
}) => {
  const getProgress = (lot) => {
    const processes = (lot.processes && lot.processes.length > 0) 
      ? lot.processes 
      : (lot.stages || []).map(s => ({ id: s.toLowerCase().replace(/\s+/g, ''), isDone: false }));
    
    if (processes.length === 0) return 0;
    const done = processes.filter(p => p.isDone).length;
    return (done / processes.length) * 100;
  };

  const hasLoss = (lot) => {
    const processes = lot.processes || [];
    if (processes.length < 2) return false;
    for (let i = 1; i < processes.length; i++) {
      if (processes[i].pieces > 0 && processes[i].pieces < processes[i-1].pieces) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1600px] mx-auto px-1 md:px-0">
      {/* Responsive Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('/')} className="text-[#111111]/40 hover:text-[#111111] transition-colors active:scale-90"><ArrowLeft size={24} /></button>
          <h2 className="text-xl md:text-3xl text-[#111111] font-display font-black tracking-tight leading-none">Lot Production</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 sm:min-w-[300px]">
            <SearchBar value={search} onChange={setSearch} placeholder="Filter by Lot #, Brand..." />
          </div>
        </div>
      </div>

      {/* Summary Metrics - Desktop Only */}
      <div className="hidden lg:grid grid-cols-4 gap-0 rounded-[2.5rem] overflow-hidden border border-[#111111]/5 shadow-premium bg-white">
        {[
          { label: 'Active Lots', value: allLots.length, icon: <Layout size={16} /> },
          { label: 'In Progress', value: allLots.filter(l => getProgress(l) < 100).length, color: 'text-blue-600' },
          { label: 'Total Output', value: allLots.reduce((acc, lot) => acc + Object.values(lot.sizes || {}).reduce((s, q) => s + (Number(q) || 0), 0), 0), unit: 'Pcs' },
          { label: 'Alerts', value: allLots.filter(hasLoss).length, color: 'text-red-500', icon: <AlertCircle size={16} /> }
        ].map((stat, i) => (
          <div key={i} className={`p-8 ${i < 3 ? 'border-r border-[#111111]/5' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#111111]/40">{stat.label}</span>
              {stat.icon && <span className={stat.color}>{stat.icon}</span>}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-display font-black tracking-tighter ${stat.color || 'text-[#111111]'}`}>{stat.value}</span>
              {stat.unit && <span className="text-[10px] font-bold text-[#111111]/30 uppercase">{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {allLots.filter(l => (l.lotNumber || '').toLowerCase().includes(search.toLowerCase())).map(lot => (
          <React.Fragment key={lot.id}>
            {/* Mobile View: Preferred Horizontal Card */}
            <motion.div 
              onClick={() => onOpenSheet(`/lot/${lot.id}`)}
              className="lg:hidden bg-white rounded-3xl border border-[#111111]/5 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex h-36">
                <div className="w-28 bg-[#111111] relative overflow-hidden flex-shrink-0">
                  {lot.itemImage ? (
                    <img src={lot.itemImage} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Layout size={32} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]/40" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="overflow-hidden">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] truncate">{lot.brand || 'AMRUT'}</p>
                        <h3 className="text-sm font-bold text-[#111111] truncate">Lot #{lot.lotNumber}</h3>
                      </div>
                      {hasLoss(lot) && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {Object.entries(lot.sizes || {}).map(([size, qty]) => (
                        <div key={size} className="flex-shrink-0 bg-[#F5F5F5] px-2 py-1 rounded-lg min-w-[32px] text-center">
                          <p className="text-[7px] font-black text-[#111111]/40 uppercase">{size}</p>
                          <p className="text-[10px] font-bold text-[#111111]">{qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${getProgress(lot)}%` }} />
                    </div>
                    <div className="flex justify-between items-center gap-2 min-w-0">
                      <div className="flex -space-x-2">
                        {(() => {
                          const processes = (lot.processes && lot.processes.length > 0) ? lot.processes : (lot.stages || []).map(s => ({ id: s.toLowerCase().replace(/\s+/g, ''), name: s, isDone: false }));
                          const uniqueMap = new Map();
                          processes.forEach(p => {
                            const id = (p.id || '').toLowerCase().replace(/\s+/g, '');
                            if (id && !uniqueMap.has(id)) uniqueMap.set(id, p);
                          });
                          return Array.from(uniqueMap.values()).slice(0, 5).map((p, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black ${p.isDone ? 'bg-[#D4AF37] text-[#111111] z-10' : 'bg-[#F5F5F5] text-[#111111]/20'}`}>
                              {p.isDone ? <CheckCircle2 size={10} /> : (p.name || '').charAt(0).toUpperCase()}
                            </div>
                          ));
                        })()}
                      </div>
                      <span className="text-[8px] font-black text-[#111111]/40 uppercase flex-shrink-0">{Math.round(getProgress(lot))}% DONE</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop View: Dashboard Grid Card */}
            <motion.div 
              onClick={() => onOpenSheet(`/lot/${lot.id}`)}
              className="hidden lg:flex group relative bg-white rounded-[2.5rem] border border-[#111111]/5 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex-col h-full overflow-hidden"
            >
              <div className="aspect-square xl:aspect-[4/5] relative bg-[#111111] overflow-hidden">
                {lot.itemImage ? (
                  <img 
                    src={lot.itemImage} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt={lot.lotNumber}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layout size={48} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-6 left-6 flex gap-2">
                   <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
                      {lot.status || 'Active'}
                   </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-1">{lot.brand || 'AMRUT'}</p>
                  <h3 className="text-3xl font-display font-black text-white tracking-tighter leading-none">Lot #{lot.lotNumber}</h3>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(lot.sizes || {}).slice(0, 4).map(([size, qty]) => (
                    <div key={size} className="bg-[#F5F5F5] p-2.5 rounded-2xl text-center">
                      <p className="text-[7px] font-black text-[#111111]/40 uppercase mb-0.5">{size}</p>
                      <p className="text-xs font-black text-[#111111]">{qty}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-display font-black text-[#111111]">{Math.round(getProgress(lot))}% <span className="text-[10px] uppercase font-black tracking-widest text-[#111111]/30 ml-2">Progress</span></p>
                    {hasLoss(lot) && <div className="text-red-500 bg-red-50 px-3 py-1.5 rounded-full text-[8px] font-black uppercase border border-red-100 flex items-center gap-1.5"><AlertCircle size={12} /> Anomaly</div>}
                  </div>
                  <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${getProgress(lot)}%` }} className="h-full bg-[#111111] rounded-full" />
                  </div>
                  
                  {/* Desktop Status Dots */}
                  <div className="flex -space-x-2 pt-2">
                    {(() => {
                      const processes = (lot.processes && lot.processes.length > 0) ? lot.processes : (lot.stages || []).map(s => ({ id: s.toLowerCase().replace(/\s+/g, ''), name: s, isDone: false }));
                      const uniqueMap = new Map();
                      processes.forEach(p => {
                        const id = (p.id || '').toLowerCase().replace(/\s+/g, '');
                        if (id && !uniqueMap.has(id)) uniqueMap.set(id, p);
                      });
                      return Array.from(uniqueMap.values()).slice(0, 8).map((p, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${p.isDone ? 'bg-[#D4AF37] text-[#111111] z-10' : 'bg-[#F5F5F5] text-[#111111]/20'}`}>
                          {p.isDone ? <CheckCircle2 size={12} /> : (p.name || '').charAt(0).toUpperCase()}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </div>
      {allLots.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-[#111111]/5 rounded-[3rem]">
          <ClipboardList size={80} strokeWidth={0.5} className="mx-auto mb-6 text-[#111111]/10" />
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#111111]/20">Awaiting Production Input</p>
        </div>
      )}

    </div>
  );
};
