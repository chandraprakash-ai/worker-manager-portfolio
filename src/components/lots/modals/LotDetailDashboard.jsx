import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Tag, Image, Check, X, Pencil, Loader2, Plus, AlertCircle } from 'lucide-react';
import { BottomSheet } from '../../ui/BottomSheet';
import { Button } from '../../ui/Button';
import { ConfirmModal } from '../../ui/ConfirmModal';

const hydrateLotData = (lot) => {
  if (!lot) return null;
  
  // Ensure all stages from the 'stages' array are present in 'processes' without duplicates
  const existingProcesses = lot.processes || [];
  const definedStages = lot.stages || [];
  
  const processMap = new Map();
  // 1. Load existing processes into the map, normalizing IDs
  existingProcesses.forEach(p => {
    const normalizedId = (p.id || '').toLowerCase().replace(/\s+/g, '');
    if (normalizedId) processMap.set(normalizedId, { ...p, id: normalizedId });
  });

  // 2. Ensure all defined stages are represented
  definedStages.forEach(stageName => {
    const stageId = stageName.toLowerCase().replace(/\s+/g, '');
    if (stageId && !processMap.has(stageId)) {
      processMap.set(stageId, {
        id: stageId,
        name: stageName,
        isDone: false,
        pieces: 0,
        billNumber: '',
        notes: '',
        pricePerPc: 0,
        numButtons: 0
      });
    }
  });

  // 3. Final list in the order of definedStages
  const hydratedProcesses = definedStages.map(stageName => {
    const stageId = stageName.toLowerCase().replace(/\s+/g, '');
    return processMap.get(stageId);
  }).filter(Boolean);

  return { 
    ...lot, 
    sizes: lot.sizes || {},
    numColors: lot.numColors || 1,
    processes: hydratedProcesses 
  };
};

export const LotDetailDashboard = ({
  isOpen,
  onClose,
  selectedLot,
  onUpdateLot,
  onUpdateProcess,
  onDeleteLot,
  onOpenSheet,
  setPreviewData
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState(null);
  const { t, i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';

  const [isSaving, setIsSaving] = useState(false);
  const CACHE_KEY = `lot_draft_${selectedLot?.id}`;

  // Initialize draftLot with hydrated data or cached data
  const [draftLot, setDraftLot] = useState(() => {
    if (!selectedLot) return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached lot', e);
      }
    }
    return hydrateLotData(selectedLot);
  });

  const matrixRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const lastSavedLotRef = useRef(draftLot);

  // Sync draft if selectedLot changes from outside
  useEffect(() => {
    if (selectedLot?.id && selectedLot.id !== draftLot?.id) {
      const newCacheKey = `lot_draft_${selectedLot.id}`;
      const cached = localStorage.getItem(newCacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setDraftLot(parsed);
          lastSavedLotRef.current = parsed;
          return;
        } catch(e) {}
      }
      const hydrated = hydrateLotData(selectedLot);
      setDraftLot(hydrated);
      lastSavedLotRef.current = hydrated;
    }
  }, [selectedLot?.id]);

  useEffect(() => {
    if (!draftLot || draftLot.id !== selectedLot?.id) return;
    
    // Validate
    const errors = {};
    const numColors = Number(draftLot.numColors) || 1;
    const basePcs = Object.values(draftLot.sizes || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalPcs = basePcs * numColors;
    
    (draftLot.processes || []).forEach((p) => {
      const pcs = Number(p.pieces) || 0;
      if (pcs > totalPcs) {
        errors[p.id] = `${p.name}: Exceeds Lot total (${totalPcs})`;
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (JSON.stringify(draftLot) === JSON.stringify(lastSavedLotRef.current)) return;

    // Cache locally
    localStorage.setItem(CACHE_KEY, JSON.stringify(draftLot));

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    // Debounce DB save
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const sanitizedLot = {
        ...draftLot,
        numColors: Number(draftLot.numColors) || 1,
        sizes: Object.fromEntries(
          Object.entries(draftLot.sizes || {}).map(([s, q]) => [s, Number(q) || 0])
        ),
        processes: (draftLot.processes || []).map(p => {
          const clean = { ...p };
          if (clean.pieces !== undefined) clean.pieces = Number(clean.pieces) || 0;
          if (clean.numButtons !== undefined) clean.numButtons = Number(clean.numButtons) || 0;
          if (clean.pricePerPc !== undefined) clean.pricePerPc = Number(clean.pricePerPc) || 0;
          return clean;
        })
      };

      try {
        await onUpdateLot(selectedLot.id, sanitizedLot);
        localStorage.removeItem(CACHE_KEY);
        lastSavedLotRef.current = draftLot;
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [draftLot, selectedLot?.id, CACHE_KEY, onUpdateLot]);

  if (!draftLot) return null;

  const handleClose = async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      if (Object.keys(validationErrors).length === 0 && JSON.stringify(draftLot) !== JSON.stringify(lastSavedLotRef.current)) {
        setIsSaving(true);
        const sanitizedLot = {
          ...draftLot,
          numColors: Number(draftLot.numColors) || 1,
          sizes: Object.fromEntries(Object.entries(draftLot.sizes || {}).map(([s, q]) => [s, Number(q) || 0])),
          processes: (draftLot.processes || []).map(p => {
            const clean = { ...p };
            if (clean.pieces !== undefined) clean.pieces = Number(clean.pieces) || 0;
            if (clean.numButtons !== undefined) clean.numButtons = Number(clean.numButtons) || 0;
            if (clean.pricePerPc !== undefined) clean.pricePerPc = Number(clean.pricePerPc) || 0;
            return clean;
          })
        };
        await onUpdateLot(selectedLot.id, sanitizedLot);
        localStorage.removeItem(CACHE_KEY);
        setIsSaving(false);
      }
    }
    onClose();
  };

  const updateDraft = (updates) => {
    // Validation for Size Matrix updates
    if (updates.sizes) {
      for (const size in updates.sizes) {
        const val = updates.sizes[size];
        if (val !== '' && (isNaN(val) || Number(val) < 0)) {
          alert(`Invalid quantity for size ${size}. Please enter a positive number.`);
          return;
        }
      }
    }
    
    // Validation for Colors
    if (updates.numColors !== undefined) {
      const val = updates.numColors;
      if (val !== '' && (isNaN(val) || Number(val) < 1)) {
        alert("Number of colors must be at least 1.");
        return;
      }
    }
    
    setDraftLot(prev => ({ ...prev, ...updates }));
  };

  const updateDraftProcess = (procId, updates) => {
    // Clear error when user starts typing
    if (validationErrors[procId]) {
      const newErrors = { ...validationErrors };
      delete newErrors[procId];
      setValidationErrors(newErrors);
    }

    // Validation: For numeric fields, ignore non-numeric or negative inputs
    const numericKeys = ['pieces', 'numButtons', 'pricePerPc'];
    for (const key of numericKeys) {
      if (updates[key] !== undefined && updates[key] !== '') {
        if (isNaN(updates[key]) || Number(updates[key]) < 0) {
          alert(`Invalid input for ${key}. Please enter a positive number.`);
          return;
        }
      }
    }
    
    setDraftLot(prev => ({
      ...prev,
      processes: (prev.processes || []).map(p => p.id === procId ? { ...p, ...updates } : p)
    }));
  };
  const numColors = Number(draftLot.numColors) || 1;
  const basePcs = Object.values(draftLot.sizes || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
  const totalLotPcs = basePcs * numColors;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} onBack={handleClose} title={t('lots.lot_details')} fullScreen>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="bg-[#111111] text-white p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-premium flex flex-col justify-between min-h-[260px]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Tag size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              <span className={`font-black uppercase text-[#D4AF37] opacity-80 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-[0.3em]'}`}>{draftLot.brand} {t('lots.batch')}</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none mb-2">#{draftLot.lotNumber}</h3>
          </div>
          <div className="relative z-10 flex items-end justify-between pt-8 border-t border-white/10">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className={`font-black uppercase text-white/30 mb-1 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[9px] tracking-widest'}`}>{t('lots.status')}</span>
                <span className={`font-black uppercase text-[#D4AF37] ${isHindi ? 'text-[15px] tracking-normal' : 'text-sm'}`}>{t(`common.${draftLot.status?.toLowerCase() || 'active'}`)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black uppercase text-[#D4AF37] mb-1 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.quantity_matrix')}</p>
              <h4 className="text-4xl font-display font-black leading-none">{totalLotPcs}</h4>
              {numColors > 1 && (
                <p className="text-white/40 text-[10px] font-black uppercase mt-2 tracking-widest">
                  {numColors} {t('lots.colors', 'COLORS')} × {basePcs} {t('lots.pcs', 'PCS')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaCard 
            label={t('lots.design_asset')} 
            url={draftLot.itemImage} 
            onClick={() => setPreviewData({ url: draftLot.itemImage, type: 'itemImage' })} 
          />
          <MediaCard 
            label={t('lots.sample_photo')} 
            url={draftLot.sampleImage} 
            onClick={() => setPreviewData({ url: draftLot.sampleImage, type: 'sampleImage' })} 
          />
        </div>

        {/* Quantity Matrix */}
        <div className="space-y-6" ref={matrixRef}>
          <div className="flex justify-between items-end">
            <h4 className={`font-black text-[#111111]/30 ${isHindi ? 'text-[16px] tracking-normal' : 'text-[10px] uppercase tracking-[0.3em]'}`}>{t('lots.quantity_matrix')}</h4>
            <div className="flex items-center gap-2 bg-white rounded-[1rem] px-3 py-1.5 border border-[#111111]/10 shadow-sm">
               <span className="text-[9px] font-black uppercase text-[#111111]/40 tracking-widest">{t('lots.colors', 'Colors')}</span>
               <input 
                 type="number" 
                 value={draftLot.numColors || 1}
                 onChange={(e) => updateDraft({ numColors: e.target.value })}
                 className="w-10 bg-transparent text-center font-black outline-none text-[#111111] text-base"
                 min="1"
               />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {Object.entries(draftLot.sizes).map(([size, qty]) => (
              <div key={size} className="bg-white border border-[#111111]/5 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center relative group transition-all hover:border-[#D4AF37]/30">
                <button 
                  onClick={() => setSizeToDelete(size)}
                  className="absolute top-2 right-2 w-6 h-6 bg-[#F5F5F5] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                >
                  <X size={10} />
                </button>
                
                <div className="text-center w-full">
                  <span className="text-[10px] font-black text-[#111111]/30 uppercase tracking-[0.2em] mb-1 block">{size}</span>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={qty}
                      onChange={(e) => updateDraft({ sizes: { ...draftLot.sizes, [size]: e.target.value } })}
                      className="w-full bg-transparent text-center text-2xl font-display font-black text-[#111111] outline-none border-none p-0"
                    />
                    <div className="h-[2px] w-6 bg-[#D4AF37]/30 mx-auto mt-1 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => onOpenSheet(`/lot/${draftLot.id}/add-sizes`)}
              className="bg-[#F5F5F5] border-2 border-dashed border-[#111111]/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37]/30 min-h-[90px] transition-all"
            >
              <div className="w-8 h-8 rounded-full border border-[#111111]/5 flex items-center justify-center">
                <Plus size={14} className="text-[#111111]/20" />
              </div>
              <span className={`font-black uppercase text-[#111111]/20 ${isHindi ? 'text-[9px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.add_size')}</span>
            </button>
          </div>

          {/* Global Notes */}
          <div className="bg-white border border-[#111111]/5 rounded-[2.5rem] p-6 shadow-premium">
            <span className={`font-black uppercase text-[#111111]/30 mb-3 block ${isHindi ? 'text-[12px] tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.notes')}</span>
            <textarea 
              value={draftLot.notes || ''}
              onChange={(e) => updateDraft({ notes: e.target.value })}
              className="w-full h-24 bg-[#F5F5F5] rounded-2xl p-4 text-sm font-bold outline-none resize-none border border-[#111111]/5 focus:border-[#D4AF37]/30 transition-all"
              placeholder={t('lots.notes_placeholder')}
            />
          </div>
        </div>

        {/* Production Pipeline */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className={`font-black text-[#111111]/40 ${isHindi ? 'text-[16px] tracking-normal' : 'text-[11px] uppercase tracking-[0.3em]'}`}>{t('lots.production_pipeline')}</h4>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {draftLot.processes.map((proc, idx) => (
              <ProcessCard 
                key={proc.id}
                proc={proc}
                idx={idx}
                draftLot={draftLot}
                totalLotPcs={totalLotPcs}
                updateDraftProcess={updateDraftProcess}
                error={validationErrors[proc.id]}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center sm:items-end pt-4">
          <div className="w-full sm:w-[400px]">
            <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#111111]/40 mb-4">
              {isSaving ? (
                <><Loader2 size={12} className="animate-spin text-[#D4AF37]" /> {t('common.saving', 'Saving...')}</>
              ) : (
                <><Check size={12} className="text-green-500" /> {t('common.saved', 'Saved')}</>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>{t('lots.delete_lot')}</Button>
              <Button variant="primary" onClick={handleClose}>{t('common.close', 'Close')}</Button>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('lots.delete_confirm_title', 'Delete Lot')}
        message={t('lots.delete_lot_prompt')}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteLot(draftLot.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText={t('lots.delete_lot', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
      />

      <ConfirmModal
        isOpen={!!sizeToDelete}
        title={t('lots.remove_size_title', 'Remove Size')}
        message={`${t('lots.remove_size_prompt')} ${sizeToDelete}?`}
        onConfirm={() => {
          updateDraft({ sizes: Object.fromEntries(Object.entries(draftLot.sizes).filter(([s]) => s !== sizeToDelete)) });
          setSizeToDelete(null);
        }}
        onCancel={() => setSizeToDelete(null)}
        confirmText={t('common.remove', 'Remove')}
        cancelText={t('common.cancel', 'Cancel')}
      />

    </BottomSheet>
  );
};

const MediaCard = ({ label, url, onClick }) => (
  <div onClick={onClick} className="bg-white border border-[#111111]/10 rounded-[2.5rem] flex flex-col items-center justify-center shadow-premium aspect-video relative overflow-hidden cursor-pointer hover:border-[#D4AF37]/40">
    {url ? (
      <img src={url} className="absolute inset-0 w-full h-full object-cover" />
    ) : (
      <div className="flex flex-col items-center gap-3">
        <Image size={24} className="text-[#111111]/20" />
        <p className="text-[11px] font-black uppercase text-[#111111]/30">{label}</p>
      </div>
    )}
  </div>
);

const ProcessCard = ({ proc, idx, draftLot, totalLotPcs, updateDraftProcess, error }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';
  const isOverLimit = Number(proc.pieces) > totalLotPcs;
  const prevPcs = idx > 0 ? Number(draftLot.processes[idx-1].pieces || 0) : totalLotPcs;
  const isDeficit = Number(proc.pieces) > 0 && Number(proc.pieces) < prevPcs;

  return (
    <div 
      id={`proc-${proc.id}`} 
      className={`p-6 rounded-[2.5rem] border transition-all relative ${error ? 'border-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.1)]' : proc.isDone ? 'bg-green-50/50 border-green-200' : 'bg-white border-[#111111]/5 shadow-premium'}`}
    >
      {error && (
        <div className="absolute -top-3 left-10 bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-20 shadow-lg flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={10} strokeWidth={4} /> {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              updateDraftProcess(proc.id, { isDone: !proc.isDone });
            }}
            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center ${proc.isDone ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-[#111111]/10 text-[#111111]/10'}`}
          >
            {proc.isDone && <Check size={24} strokeWidth={4} />}
          </button>
          <div>
            <h3 className="text-lg font-display font-black text-[#111111]">{t(`stages.${proc.id}`)}</h3>
            <p className={`font-black uppercase text-[#111111]/30 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[9px] tracking-widest'}`}>{proc.isDone ? '' : t('lots.awaiting_input')}</p>
          </div>
        </div>
        <div className="flex flex-col items-end relative" onClick={(e) => e.stopPropagation()}>
          <div className={`flex items-center gap-1.5 p-2 rounded-2xl ${error ? 'bg-red-50 ring-2 ring-red-500/20' : isOverLimit ? 'bg-orange-50' : isDeficit ? 'bg-amber-50' : 'bg-[#F5F5F5]'}`}>
            <span className={`font-black ml-3 opacity-40 ${isHindi ? 'text-[16px] tracking-normal' : 'text-[14px]'}`}>{t('lots.pcs')}</span>
            <input 
              type="number" 
              value={proc.pieces || ''} 
              onChange={(e) => updateDraftProcess(proc.id, { pieces: e.target.value })}
              className="w-16 bg-transparent text-center font-black outline-none text-xl"
            />
          </div>
          <div className="absolute -bottom-5 right-1 whitespace-nowrap">
            {isOverLimit && <span className={`font-black text-orange-600 uppercase ${isHindi ? 'text-[9px] tracking-normal' : 'text-[7px] tracking-widest'}`}>{t('lots.over_limit')}</span>}
            {isDeficit && <span className={`font-black text-amber-500 uppercase animate-pulse ${isHindi ? 'text-[9px] tracking-normal' : 'text-[7px] tracking-widest'}`}>{t('lots.deficit_warning')}</span>}
          </div>
        </div>
      </div>
      
      {/* Detail Fields for All Cards */}
      <div className="mt-6 pt-6 border-t border-[#111111]/5">
         <div className="grid grid-cols-2 gap-4">
            {['screening', 'embroidery'].includes(proc.id) && (
              <div className="space-y-1">
                <span className={`font-black uppercase text-[#111111]/20 ml-2 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.reference_id')}</span>
                <input 
                  type="text" 
                  value={proc.billNumber || ''} 
                  onChange={(e) => updateDraftProcess(proc.id, { billNumber: e.target.value })}
                  className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-sm font-bold"
                  placeholder="Ref / Bill #"
                />
              </div>
            )}

            {proc.id === 'diamond' && (
              <div className="space-y-1">
                <span className={`font-black uppercase text-[#111111]/20 ml-2 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.rate_currency')}</span>
                <input 
                  type="number" 
                  value={proc.pricePerPc || ''} 
                  onChange={(e) => updateDraftProcess(proc.id, { pricePerPc: e.target.value })}
                  className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-sm font-bold font-display"
                  placeholder="₹ 0.00"
                />
              </div>
            )}

            {proc.id === 'button' && (
              <>
                <div className="space-y-1">
                  <span className={`font-black uppercase text-[#111111]/20 ml-2 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.hardware_pc')}</span>
                  <input 
                    type="number" 
                    value={proc.numButtons || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { numButtons: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-sm font-bold"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <span className={`font-black uppercase text-[#111111]/20 ml-2 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.rate_currency')}</span>
                  <input 
                    type="number" 
                    value={proc.pricePerPc || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { pricePerPc: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-sm font-bold font-display"
                    placeholder="₹ 0.00"
                  />
                </div>
              </>
            )}

            {/* Notes Field (Always Present) */}
            <div className={`space-y-1 ${!['screening', 'embroidery', 'diamond'].includes(proc.id) ? 'col-span-2' : ''}`}>
              <span className={`font-black uppercase text-[#111111]/20 ml-2 ${isHindi ? 'text-[10px] tracking-normal' : 'text-[8px] tracking-widest'}`}>{t('lots.observations')}</span>
              <div 
                onClick={() => setIsNotesOpen(true)}
                className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 flex items-center text-sm font-bold text-[#111111] cursor-pointer hover:border-[#111111]/20 transition-all"
              >
                <span className="truncate opacity-50">{proc.notes || t('lots.notes_short')}</span>
              </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {isNotesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setIsNotesOpen(false); }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-[#111111] text-white flex justify-between items-center">
                <h3 className="font-display font-black text-xl">{t(`stages.${proc.id}`)} - {t('lots.observations')}</h3>
                <button onClick={() => setIsNotesOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-all active:scale-95">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <textarea 
                  value={proc.notes || ''} 
                  onChange={(e) => updateDraftProcess(proc.id, { notes: e.target.value })}
                  className="w-full h-40 bg-[#F5F5F5] rounded-3xl p-5 text-sm font-bold outline-none resize-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  placeholder={t('lots.notes_placeholder')}
                  autoFocus
                />
                <Button variant="primary" fullWidth onClick={() => setIsNotesOpen(false)}>
                  {t('common.save')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
