import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layout, ClipboardList, Plus, AlertCircle, CheckCircle2, Search, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/cloudinary';

export const LotDashboard = ({ 
  search, 
  setSearch, 
  allLots, 
  onNavigate, 
  onOpenSheet 
}) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';
  const [brandFilter, setBrandFilter] = React.useState('ALL');
  const [showCleared, setShowCleared] = React.useState(false);
  const [viewMode, setViewMode] = React.useState(() => {
    return localStorage.getItem('lotViewMode') || 'list';
  });
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('newest'); // 'newest' | 'oldest' | 'num-desc' | 'num-asc'
  const [timeFilter, setTimeFilter] = React.useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');
  
  const searchContainerRef = React.useRef(null);

  const handleBrandFilterChange = (filter) => {
    setBrandFilter(filter);
  };

  // Click outside search listener to close search bar
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Back button search handling
  React.useEffect(() => {
    if (isSearchOpen) {
      window.history.pushState({ searchActive: true }, '');
      
      const handlePopState = (e) => {
        setIsSearchOpen(false);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setSearch('');
    setIsSearchOpen(false);
    if (window.history.state?.searchActive) {
      window.history.back();
    }
  };

  // Back button filter handling
  React.useEffect(() => {
    if (isFilterOpen) {
      window.history.pushState({ filterActive: true }, '');
      
      const handlePopState = (e) => {
        setIsFilterOpen(false);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isFilterOpen]);

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
    if (window.history.state?.filterActive) {
      window.history.back();
    }
  };

  const getLotTimestamp = (lot) => {
    if (!lot.createdAt) return 0;
    if (lot.createdAt.seconds) return lot.createdAt.seconds * 1000;
    if (lot.createdAt.toDate) return lot.createdAt.toDate().getTime();
    return new Date(lot.createdAt).getTime() || 0;
  };

  const now = Date.now();

  const filteredLots = allLots.filter(l => {
    const matchesSearch = (l.lotNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.brand || '').toLowerCase().includes(search.toLowerCase());
      
    const isCleared = l.status === 'cleared';
    const matchesStatus = showCleared ? isCleared : !isCleared;
    
    if (!matchesStatus) return false;
    if (!matchesSearch) return false;
    
    if (brandFilter !== 'ALL' && (l.brand || 'AMRUT').toUpperCase() !== brandFilter.toUpperCase()) return false;

    // Time filter
    if (timeFilter !== 'all') {
      const lotTime = getLotTimestamp(l);
      if (!lotTime) return false;
      const diffMs = now - lotTime;
      
      if (timeFilter === 'today') {
        if (diffMs > 24 * 60 * 60 * 1000) return false;
      } else if (timeFilter === 'week') {
        if (diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (timeFilter === 'month') {
        if (diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      } else if (timeFilter === 'custom') {
        if (customFrom) {
          const fromTime = new Date(customFrom).setHours(0,0,0,0);
          if (lotTime < fromTime) return false;
        }
        if (customTo) {
          const toTime = new Date(customTo).setHours(23,59,59,999);
          if (lotTime > toTime) return false;
        }
      }
    }

    return true;
  });

  const sortedLots = [...filteredLots].sort((a, b) => {
    if (sortBy === 'newest') {
      return getLotTimestamp(b) - getLotTimestamp(a);
    }
    if (sortBy === 'oldest') {
      return getLotTimestamp(a) - getLotTimestamp(b);
    }
    if (sortBy === 'num-desc') {
      return (Number(b.lotNumber) || 0) - (Number(a.lotNumber) || 0);
    }
    if (sortBy === 'num-asc') {
      return (Number(a.lotNumber) || 0) - (Number(b.lotNumber) || 0);
    }
    return 0;
  });

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
      <div className="flex items-center justify-between gap-4 border-b border-[#111111]/5 pb-4 min-h-[56px]">
        <AnimatePresence mode="wait">
          {!isSearchOpen && (
            <motion.h2 
              key="title"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className={`text-xl md:text-2xl text-[#111111] font-display font-black tracking-tight leading-none ${isHindi ? 'mt-1' : ''}`}
            >
              {t('lots.lot_production')}
            </motion.h2>
          )}
        </AnimatePresence>

        <div className={`flex items-center gap-2 ${isSearchOpen ? 'w-full justify-end' : ''}`}>
          {/* Collapsible Search Input */}
          <div ref={searchContainerRef} className={`relative flex items-center ${isSearchOpen ? 'w-full max-w-md' : ''}`}>
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative flex items-center w-full"
                >
                  <Search size={14} className="absolute left-3 text-[#111111]/45" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('lots.search_placeholder', 'Search...')}
                    className="w-full h-10 pl-9 pr-9 bg-[#F5F5F5] rounded-xl text-xs font-bold focus:outline-none focus:ring-0 border border-transparent focus:border-[#111111]/5"
                    autoFocus
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-8 text-[#111111]/40 hover:text-[#111111]"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button 
                    onClick={handleCloseSearch}
                    className="absolute right-3 text-[#111111]/40 hover:text-[#111111]"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSearchOpen && (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsFilterOpen(false);
                }}
                className="p-2.5 bg-[#F5F5F5] text-[#111111] hover:bg-[#E5E5E5] rounded-xl transition-all"
                title={t('common.search')}
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => {
              setIsFilterOpen(true);
              setIsSearchOpen(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${isFilterOpen || sortBy !== 'newest' || timeFilter !== 'all' ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#111111] hover:bg-[#E5E5E5]'}`}
            title="Filters & Sorting"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* View Mode Toggle Button */}
          <button
            onClick={() => {
              const newMode = viewMode === 'list' ? 'grid' : 'list';
              setViewMode(newMode);
              localStorage.setItem('lotViewMode', newMode);
            }}
            className="p-2.5 bg-[#F5F5F5] text-[#111111] hover:bg-[#E5E5E5] rounded-xl transition-all"
            title={viewMode === 'list' ? "Grid View" : "List View"}
          >
            {viewMode === 'list' ? <Grid size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Brand & Status Selectors - Always On Screen (Compact No-Label design, card wrapping removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['ALL', 'RKT', 'KS4U'].map(filter => (
            <button
              key={filter}
              onClick={() => handleBrandFilterChange(filter)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${brandFilter === filter ? 'bg-[#111111] text-[#D4AF37]' : 'text-[#111111]/40 hover:text-[#111111]'}`}
            >
              {filter === 'ALL' ? t('common.all') : filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#E5E5E5] p-1 rounded-full w-full sm:w-auto">
          <button
            onClick={() => setShowCleared(false)}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!showCleared ? 'bg-[#111111] text-[#D4AF37]' : 'text-[#111111]/40 hover:text-[#111111]'}`}
          >
            {t('lots.active_lots', 'Active Lots')}
          </button>
          <button
            onClick={() => setShowCleared(true)}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${showCleared ? 'bg-[#111111] text-[#D4AF37]' : 'text-[#111111]/40 hover:text-[#111111]'}`}
          >
            {t('lots.cleared_lots', 'Cleared Lots')}
          </button>
        </div>
      </div>

      {/* Filter Popup Modal Card (Frosted glass backdrop, back button enabled, grid view radio controls) */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseFilter}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 border border-[#111111]/5 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-widest text-[#111111]">
                  {t('lots.filters_title', 'Filters & Sorting')}
                </h3>
                <button
                  onClick={handleCloseFilter}
                  className="p-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-full text-[#111111]/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid View for Filter Options with Custom Radio Buttons */}
              <div className="space-y-5">
                {/* Time Range Selector */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111111]/30">{t('lots.filter_by_time', 'Filter by Time')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: t('lots.time_all', 'All Time') },
                      { id: 'today', label: t('lots.time_today', 'Today') },
                      { id: 'week', label: t('lots.time_week', 'This Week') },
                      { id: 'month', label: t('lots.time_month', 'This Month') }
                    ].map(option => (
                      <div
                        key={option.id}
                        onClick={() => {
                          setTimeFilter(option.id);
                          // Clear custom range when picking standard range
                          setCustomFrom('');
                          setCustomTo('');
                        }}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${timeFilter === option.id ? 'border-[#111111] bg-[#111111]/5' : 'border-[#111111]/5 hover:bg-[#F5F5F5]'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeFilter === option.id ? 'border-[#111111]' : 'border-[#111111]/30'}`}>
                          {timeFilter === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Picker */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111111]/30">{t('lots.custom_range', 'Or Custom Date Range')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[8px] font-black uppercase tracking-widest text-[#111111]/30">{t('lots.date_from', 'From')}</span>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => {
                          setCustomFrom(e.target.value);
                          setTimeFilter('custom');
                        }}
                        className="w-full h-11 pl-3 pr-2 pt-4 bg-[#F5F5F5] rounded-2xl text-[11px] font-black focus:outline-none border border-transparent focus:border-[#111111]/10 text-[#111111]"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[8px] font-black uppercase tracking-widest text-[#111111]/30">{t('lots.date_to', 'To')}</span>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => {
                          setCustomTo(e.target.value);
                          setTimeFilter('custom');
                        }}
                        className="w-full h-11 pl-3 pr-2 pt-4 bg-[#F5F5F5] rounded-2xl text-[11px] font-black focus:outline-none border border-transparent focus:border-[#111111]/10 text-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sorting Options Selector */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111111]/30">{t('lots.sort_order', 'Sort Order')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'newest', label: t('lots.sort_newest', 'Newest First') },
                      { id: 'oldest', label: t('lots.sort_oldest', 'Oldest First') },
                      { id: 'num-desc', label: t('lots.sort_num_desc', 'Lot No: High to Low') },
                      { id: 'num-asc', label: t('lots.sort_num_asc', 'Lot No: Low to High') }
                    ].map(option => (
                      <div
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${sortBy === option.id ? 'border-[#111111] bg-[#111111]/5' : 'border-[#111111]/5 hover:bg-[#F5F5F5]'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sortBy === option.id ? 'border-[#111111]' : 'border-[#111111]/30'}`}>
                          {sortBy === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset/Apply Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setTimeFilter('all');
                    setSortBy('newest');
                    setCustomFrom('');
                    setCustomTo('');
                  }}
                  className="flex-1 py-3 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#111111] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {t('common.reset', 'Reset')}
                </button>
                <button
                  onClick={handleCloseFilter}
                  className="flex-1 py-3 bg-[#111111] hover:bg-[#222222] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {t('common.apply', 'Apply')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Metrics - Desktop Only */}
      <div className="hidden lg:grid grid-cols-4 gap-0 rounded-[2.5rem] overflow-hidden border border-[#111111]/5 shadow-premium bg-white">
        {[
          { label: t('lots.active_lots'), value: filteredLots.length, icon: <Layout size={16} /> },
          { label: t('lots.in_progress'), value: filteredLots.filter(l => getProgress(l) < 100).length, color: 'text-blue-600' },
          { label: t('lots.total_output'), value: filteredLots.reduce((acc, lot) => acc + Object.values(lot.sizes || {}).reduce((s, q) => s + (Number(q) || 0), 0), 0), unit: t('lots.pcs') },
          { label: t('lots.alerts'), value: filteredLots.filter(hasLoss).length, color: 'text-red-500', icon: <AlertCircle size={16} /> }
        ].map((stat, i) => (
          <div key={i} className={`p-8 ${i < 3 ? 'border-r border-[#111111]/5' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-black uppercase text-[#111111]/40 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{stat.label}</span>
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
      <div className={viewMode === 'list' 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
        : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      }>
        {sortedLots.map(lot => (
          <React.Fragment key={lot.id}>
            {viewMode === 'list' ? (
              /* List View Card */
              <motion.div 
                onClick={() => onOpenSheet(`/lot/${lot.id}`)}
                className="bg-white rounded-3xl border border-[#111111]/5 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="flex h-36">
                  <div className="w-28 bg-[#111111] relative overflow-hidden flex-shrink-0">
                    {lot.itemImage ? (
                      <img 
                        src={getOptimizedImageUrl(lot.itemImage, 400)} 
                        loading="lazy" 
                        decoding="async" 
                        className="w-full h-full object-cover opacity-80" 
                        alt=""
                      />
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
                          <h3 className="text-sm font-bold text-[#111111] truncate">{t('lots.lot_number')}{lot.lotNumber}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#F5F5F5] border border-[#111111]/5 rounded-xl flex flex-col items-center justify-center px-3 py-1 min-w-[40px] h-9 shadow-sm">
                            <span className="text-[13px] font-display font-black text-[#111111] leading-none">{lot.numColors || 1}</span>
                            <span className="text-[6px] font-black uppercase tracking-widest text-[#111111]/50 mt-0.5">{t('lots.colors', 'CLR')}</span>
                          </div>
                          {hasLoss(lot) && <AlertCircle size={14} className="text-red-500" />}
                        </div>
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
                        <span className={`font-black text-[#111111]/40 uppercase flex-shrink-0 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[8px]'}`}>{Math.round(getProgress(lot))}% {t('lots.percent_done')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Grid View Card - Image Only with 2-Column Minimal Overlay */
              <motion.div 
                onClick={() => onOpenSheet(`/lot/${lot.id}`)}
                className="group relative bg-[#111111] rounded-[1.5rem] border border-[#111111]/5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer aspect-[3/4] overflow-hidden flex flex-col justify-end"
              >
                {lot.itemImage ? (
                  <img 
                    src={getOptimizedImageUrl(lot.itemImage, 400)} 
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={lot.lotNumber}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layout size={36} className="text-white/10" />
                  </div>
                )}
                
                {/* Overlay shadow gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 transition-opacity duration-300" />
                
                {/* Top Badge */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                   <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-black uppercase text-white text-[6px] tracking-wider leading-none">
                      {t(`common.${(lot.status || 'active').toLowerCase()}`)}
                   </span>
                </div>

                {/* Bottom Overlay text */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex flex-col pointer-events-none">
                  <span className="text-[7px] font-black uppercase tracking-widest text-[#D4AF37] leading-none mb-0.5">
                    {lot.brand || 'AMRUT'}
                  </span>
                  <div className="flex items-end justify-between gap-1.5">
                    <h3 className="text-xs font-display font-black text-white tracking-tight truncate leading-none">
                      {t('lots.lot_number')}{lot.lotNumber}
                    </h3>
                    <div className="bg-white/15 backdrop-blur-md border border-white/10 rounded-md flex flex-col items-center justify-center px-1.5 py-0.5 min-w-[24px] h-6 shadow-sm shrink-0">
                      <span className="text-[10px] font-display font-black text-white leading-none">{lot.numColors || 1}</span>
                      <span className="text-[4px] font-black uppercase tracking-widest text-white/60 leading-none mt-0.5">{t('lots.colors', 'CLR')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
      {allLots.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-[#111111]/5 rounded-[3rem]">
          <ClipboardList size={80} strokeWidth={0.5} className="mx-auto mb-6 text-[#111111]/10" />
          <p className={`font-black uppercase text-[#111111]/20 ${isHindi ? 'text-[14px] tracking-normal' : 'text-[11px] tracking-[0.5em]'}`}>{t('lots.awaiting_production')}</p>
        </div>
      )}

    </div>
  );
};
