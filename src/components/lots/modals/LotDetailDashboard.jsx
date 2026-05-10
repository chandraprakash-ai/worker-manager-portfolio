import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Image, Check, X, Pencil, Loader2, Plus, AlertCircle } from 'lucide-react';
import { BottomSheet } from '../../ui/BottomSheet';
import { Button } from '../../ui/Button';

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
  const [collapsedStages, setCollapsedStages] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize draftLot with hydrated data
  const [draftLot, setDraftLot] = useState(() => hydrateLotData(selectedLot));

  const matrixRef = useRef(null);

  // Sync draft if selectedLot changes from outside
  useEffect(() => {
    if (selectedLot?.id && selectedLot.id !== draftLot?.id) {
      setDraftLot(hydrateLotData(selectedLot));
    }
  }, [selectedLot?.id]);

  if (!draftLot) return null;

  const handleFinalSave = async () => {
    const errors = {};
    const totalPcs = Object.values(draftLot.sizes || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
    
    (draftLot.processes || []).forEach((p) => {
      const pcs = Number(p.pieces) || 0;
      if (pcs > totalPcs) {
        errors[p.id] = `${p.name}: Exceeds Lot total (${totalPcs})`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorId = Object.keys(errors)[0];
      const element = document.getElementById(`proc-${firstErrorId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Sanitize numeric fields before saving
    const sanitizedLot = {
      ...draftLot,
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

    await onUpdateLot(selectedLot.id, sanitizedLot);
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
  const totalLotPcs = Object.values(draftLot.sizes || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} onBack={onClose} title="Lot Dashboard" fullScreen>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="bg-[#111111] text-white p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-premium flex flex-col justify-between min-h-[260px]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Tag size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] opacity-80">{draftLot.brand} Batch</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none mb-2">{draftLot.lotNumber}</h3>
          </div>
          <div className="relative z-10 flex items-end justify-between pt-8 border-t border-white/10">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Status</span>
                <span className="text-sm font-black uppercase text-[#D4AF37]">{draftLot.status}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Total Pieces</p>
              <h4 className="text-4xl font-display font-black leading-none">{totalLotPcs}</h4>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaCard 
            label="Design Asset" 
            url={draftLot.itemImage} 
            onClick={() => setPreviewData({ url: draftLot.itemImage, type: 'itemImage' })} 
          />
          <MediaCard 
            label="Sample Photo" 
            url={draftLot.sampleImage} 
            onClick={() => setPreviewData({ url: draftLot.sampleImage, type: 'sampleImage' })} 
          />
        </div>

        {/* Quantity Matrix */}
        <div className="space-y-6" ref={matrixRef}>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]/30">Quantity Matrix</h4>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {Object.entries(draftLot.sizes).map(([size, qty]) => (
              <div key={size} className="bg-white border border-[#111111]/5 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center relative group transition-all hover:border-[#D4AF37]/30">
                <button 
                  onClick={() => confirm(`Remove size ${size}?`) && updateDraft({ sizes: Object.fromEntries(Object.entries(draftLot.sizes).filter(([s]) => s !== size)) })}
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
              <span className="text-[8px] font-black uppercase tracking-widest text-[#111111]/20">Add Size</span>
            </button>
          </div>
        </div>

        {/* Production Pipeline */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#111111]/40">Production Pipeline</h4>
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
                isCollapsed={collapsedStages[proc.id]}
                toggleCollapse={() => setCollapsedStages(prev => ({ ...prev, [proc.id]: !prev[proc.id] }))}
                error={validationErrors[proc.id]}
              />
            ))}
          </div>
        </div>

        {/* Notes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#111111]/5 rounded-[3rem] p-6 shadow-premium">
            <span className="text-sm font-black uppercase text-[#111111] mb-4 block">Notes</span>
            <textarea 
              value={draftLot.notes || ''}
              onChange={(e) => updateDraft({ notes: e.target.value })}
              className="w-full h-32 bg-transparent text-[15px] font-bold outline-none resize-none"
              placeholder="Add production observations..."
            />
          </div>
          <div className="flex flex-col justify-end gap-4">
            <Button variant="danger" onClick={() => confirm('Permanently delete this lot?') && onDeleteLot(draftLot.id)}>Delete Lot</Button>
            <Button variant="primary" onClick={handleFinalSave}>Save & Close</Button>
          </div>
        </div>
      </div>
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

const ProcessCard = ({ proc, idx, draftLot, totalLotPcs, updateDraftProcess, isCollapsed, toggleCollapse, error }) => {
  const isOverLimit = Number(proc.pieces) > totalLotPcs;
  const prevPcs = idx > 0 ? Number(draftLot.processes[idx-1].pieces || 0) : totalLotPcs;
  const isDeficit = Number(proc.pieces) > 0 && Number(proc.pieces) < prevPcs;
  const isContractorStage = ['screening', 'embroidery', 'diamond', 'button'].includes(proc.id);

  return (
    <div id={`proc-${proc.id}`} className={`p-6 rounded-[2.5rem] border transition-all relative ${error ? 'border-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.1)]' : proc.isDone ? 'bg-green-50/50 border-green-200' : 'bg-white border-[#111111]/5 shadow-premium'}`}>
      {error && (
        <div className="absolute -top-3 left-10 bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-20 shadow-lg flex items-center gap-1.5 animate-bounce">
          <AlertCircle size={10} strokeWidth={4} /> {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => updateDraftProcess(proc.id, { isDone: !proc.isDone })}
            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center ${proc.isDone ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-[#111111]/10 text-[#111111]/10'}`}
          >
            {proc.isDone && <Check size={24} strokeWidth={4} />}
          </button>
          <div onClick={toggleCollapse} className="cursor-pointer">
            <h3 className="text-lg font-display font-black text-[#111111]">{proc.name}</h3>
            <p className="text-[9px] font-black uppercase text-[#111111]/30">{proc.isDone ? 'Validated' : 'Awaiting Input'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl ${error ? 'bg-red-50 ring-2 ring-red-500/20' : isOverLimit ? 'bg-orange-50' : isDeficit ? 'bg-amber-50' : 'bg-[#F5F5F5]'}`}>
            <span className="text-[11px] font-black ml-3 opacity-40">Pcs</span>
            <input 
              type="number" 
              value={proc.pieces || ''} 
              onChange={(e) => updateDraftProcess(proc.id, { pieces: e.target.value })}
              className="w-16 bg-transparent text-center font-black outline-none"
            />
          </div>
          {isOverLimit && <span className="text-[7px] font-black text-orange-600 uppercase">Over Limit</span>}
          {isDeficit && <span className="text-[7px] font-black text-amber-500 uppercase animate-pulse">Deficit Warning</span>}
        </div>
      </div>
      
      {/* Expanded Logic */}
      {!isCollapsed && (
        <div className="mt-6 pt-6 border-t border-[#111111]/5">
           {/* Screening & Embroidery: Ref & Notes */}
           {['screening', 'embroidery'].includes(proc.id) && (
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-[#111111]/20 ml-2">Reference ID</span>
                  <input 
                    type="text" 
                    value={proc.billNumber || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { billNumber: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-[10px] font-bold"
                    placeholder="Ref / Bill #"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-[#111111]/20 ml-2">Observations</span>
                  <input 
                    type="text" 
                    value={proc.notes || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { notes: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-[10px] font-bold"
                    placeholder="Notes..."
                  />
                </div>
             </div>
           )}

           {/* Diamond: Only Rate */}
           {proc.id === 'diamond' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-[#111111]/20 ml-2">Rate (₹)</span>
                  <input 
                    type="number" 
                    value={proc.pricePerPc || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { pricePerPc: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-[10px] font-bold font-display"
                    placeholder="₹ 0.00"
                  />
                </div>
              </div>
           )}

           {/* Button: Hardware & Rate */}
           {proc.id === 'button' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-[#111111]/20 ml-2">Hardware / PC</span>
                  <input 
                    type="number" 
                    value={proc.numButtons || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { numButtons: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-[10px] font-bold"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-[#111111]/20 ml-2">Rate (₹)</span>
                  <input 
                    type="number" 
                    value={proc.pricePerPc || ''} 
                    onChange={(e) => updateDraftProcess(proc.id, { pricePerPc: e.target.value })}
                    className="w-full h-10 bg-white border border-[#111111]/5 rounded-xl px-4 text-[10px] font-bold font-display"
                    placeholder="₹ 0.00"
                  />
                </div>
              </div>
           )}
        </div>
      )}

      {['screening', 'embroidery', 'diamond', 'button'].includes(proc.id) && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className={`h-1 rounded-full transition-all duration-500 ${isCollapsed ? 'bg-[#111111]/5 w-8' : 'bg-[#D4AF37]/20 w-12'}`} />
        </div>
      )}
    </div>
  );
};
