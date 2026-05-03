import React, { useState, useRef } from 'react';
import { Plus, Check, ClipboardList, Camera, Image, Tag, IndianRupee, X, AlertCircle, Trash2, FileText } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

export const LotModals = ({ 
  isAddLotOpen, closeSheet, handleAddLot, newLot, setNewLot, 
  isLotDetailOpen, selectedLot, onUpdateProcess, onUpdateLot, onDeleteLot 
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isExtendSizesOpen, setIsExtendSizesOpen] = useState(false);
  const allAvailableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const activeSizes = Object.keys(newLot.sizes);
  const [localError, setLocalError] = useState('');
  const [extendSizes, setExtendSizes] = useState({});
  const designInputRef = useRef(null);
  const sampleInputRef = useRef(null);

  const toggleSize = (size) => {
    const updatedSizes = { ...newLot.sizes };
    if (activeSizes.includes(size)) {
      delete updatedSizes[size];
    } else {
      updatedSizes[size] = '';
    }
    setNewLot({ ...newLot, sizes: updatedSizes });
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    if (activeSizes.length === 0) {
      setLocalError('Please select at least one size');
      return;
    }
    
    const missingQty = activeSizes.find(s => !newLot.sizes[s] || Number(newLot.sizes[s]) <= 0);
    if (missingQty) {
      setLocalError(`Please enter quantity for size ${missingQty}`);
      return;
    }

    setLocalError('');
    handleAddLot(e);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLot({ ...newLot, [type]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Add Lot Sheet */}
      <BottomSheet isOpen={isAddLotOpen} onClose={closeSheet} title="Initialize Production Lot">
        <form onSubmit={validateAndSubmit} className="space-y-8 pb-10">
          <div className="space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Select Brand / Label</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F5F5F5] rounded-[1.5rem]">
                {['KS4U', 'RKT'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setNewLot({ ...newLot, brand: b })}
                    className={`py-4 rounded-[1.25rem] text-xs font-black transition-all ${newLot.brand === b ? 'bg-[#111111] text-[#D4AF37] shadow-xl' : 'text-[#111111]/30 hover:text-[#111111]'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                 <div>
                  <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-3 ml-1">Lot / Batch ID</label>
                  <input 
                    type="text" 
                    required 
                    value={newLot.lotNumber} 
                    onChange={(e) => setNewLot({ ...newLot, lotNumber: e.target.value })} 
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold text-xl uppercase" 
                    placeholder="AF-2024-01" 
                  />
                  <p className="text-[8px] text-[#111111]/20 font-black uppercase mt-2 ml-1">Alphanumeric, dashes & hyphens allowed</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest mb-1 ml-1">Select Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableSizes.map(size => (
                      <button 
                        key={size} 
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${activeSizes.includes(size) ? 'bg-[#111111] text-[#D4AF37]' : 'bg-[#F5F5F5] text-[#111111]/20 hover:text-[#111111]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div 
                onClick={() => designInputRef.current?.click()}
                className="bg-[#111111] rounded-[2.5rem] min-h-[160px] text-center flex flex-col items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer"
              >
               <input 
                 type="file" 
                 ref={designInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={(e) => handleImageUpload(e, 'itemImage')}
               />
               {newLot.itemImage ? (
                 <>
                   <img src={newLot.itemImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                   <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <Check size={20} className="text-[#D4AF37]" />
                      </div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Update Design</p>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Camera size={32} className="text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-4">Add Design (Optional)</p>
                 </>
               )}
            </div>
          </div>
          
          <div className="space-y-4">
             <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Production Quantities</label>
             <div className="grid grid-cols-4 gap-3">
               {activeSizes.map(size => (
                 <div key={size} className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm">
                    <p className="text-center text-[10px] font-black mb-2 text-[#111111]/40">{size}</p>
                    <input 
                      type="number" 
                      value={newLot.sizes[size] || ''} 
                      onChange={(e) => setNewLot({ ...newLot, sizes: { ...newLot.sizes, [size]: e.target.value } })}
                      className="w-full bg-[#F5F5F5] rounded-xl p-2 text-center text-xs font-bold outline-none border-none"
                      placeholder="0"
                    />
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-4">
             <label className="block text-[10px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Production Workflow (Select Required Stages)</label>
             <div className="grid grid-cols-2 gap-2">
               {[
                 { id: 'screening', name: 'Screening' },
                 { id: 'embroidery', name: 'Embroidery' },
                 { id: 'cutting', name: 'Cutting' },
                 { id: 'stitching', name: 'Stitching' },
                 { id: 'interlock', name: 'Interlock' },
                 { id: 'diamond', name: 'Diamond' },
                 { id: 'button', name: 'Button' },
                 { id: 'steampress', name: 'Steam Press' }
               ].map(stage => (
                 <button
                   key={stage.id}
                   type="button"
                   onClick={() => {
                     const current = newLot.stages || [];
                     const updated = current.includes(stage.id) 
                       ? current.filter(id => id !== stage.id) 
                       : [...current, stage.id];
                     setNewLot({ ...newLot, stages: updated });
                   }}
                   className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${newLot.stages.includes(stage.id) ? 'bg-[#111111] border-[#111111] text-[#D4AF37]' : 'bg-white border-[#F5F5F5] text-[#111111]/30'}`}
                 >
                   <div className={`w-2 h-2 rounded-full ${newLot.stages.includes(stage.id) ? 'bg-[#D4AF37]' : 'bg-[#111111]/10'}`} />
                   <span className="text-[10px] font-black uppercase tracking-widest">{stage.name}</span>
                 </button>
               ))}
             </div>
          </div>

          <div 
            onClick={() => sampleInputRef.current?.click()}
            className="bg-[#F5F5F5] min-h-[120px] p-6 rounded-[2.5rem] border-2 border-dashed border-surface-200 text-center flex flex-col items-center justify-center group cursor-pointer hover:border-[#D4AF37]/30 transition-all relative overflow-hidden"
          >
             <input 
               type="file" 
               ref={sampleInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={(e) => handleImageUpload(e, 'sampleImage')}
             />
             {newLot.sampleImage ? (
               <>
                 <img src={newLot.sampleImage} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                 <Check size={24} className="text-green-500 mb-2 relative z-10" />
                 <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest relative z-10">Cloth Sample Attached</p>
               </>
             ) : (
               <>
                 <Image size={24} className="text-[#111111]/20 mb-2 group-hover:text-[#D4AF37] transition-colors" />
                 <p className="text-[10px] font-black text-[#111111]/30 uppercase tracking-widest px-4">Attach Cloth Sample Photo (Meters/Calcs)</p>
               </>
             )}
          </div>

          <div className="bg-[#111111] text-[#D4AF37] p-6 rounded-[2rem] shadow-premium">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Planned Production</p>
                <h4 className="text-3xl font-display font-bold">{Object.values(newLot.sizes).reduce((a, b) => Number(a) + Number(b), 0)} Pcs</h4>
              </div>
              <Tag size={24} />
            </div>
          </div>

          </div>
          {localError && (
            <p className="text-center text-xs font-black text-red-500 uppercase tracking-widest animate-pulse pb-2">{localError}</p>
          )}
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Initialize Production Cycle</button>
        </form>
      </BottomSheet>

      {/* Lot Detail Matrix Sheet */}
      <BottomSheet isOpen={isLotDetailOpen} onClose={closeSheet} onBack={closeSheet} title={`Lot Dashboard`} fullScreen>
        {selectedLot && (
          <div className="space-y-8 pb-10">
              {/* Refined Compact Header Section */}
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 md:gap-6 items-stretch">
                  <div className="bg-[#111111] text-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden shadow-premium flex flex-col justify-between min-h-[240px]">
                     <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10">
                        <Tag size={80} strokeWidth={1} />
                     </div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] opacity-80">{selectedLot.brand} Batch Unit</span>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-none">{selectedLot.lotNumber}</h3>
                     </div>

                     <div className="relative z-10 flex items-end justify-between pt-6 border-t border-white/5">
                        <div className="flex gap-6">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">Established</span>
                              <span className="text-[11px] font-bold">{new Date(selectedLot.createdAt).toLocaleDateString()}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">Status</span>
                              <span className="text-[11px] font-black uppercase text-[#D4AF37]">{selectedLot.status}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Total Pieces</p>
                           <h4 className="text-4xl font-display font-black leading-none">{Object.values(selectedLot.sizes).reduce((a, b) => Number(a) + Number(b), 0)}</h4>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                    <div className="bg-white border border-[#111111]/5 rounded-[2rem] p-4 flex flex-col items-center justify-center gap-2 shadow-premium group relative overflow-hidden aspect-square xl:aspect-auto xl:h-[calc(50%-8px)]">
                        <div 
                          onClick={() => selectedLot.itemImage ? setPreviewImage(selectedLot.itemImage) : designInputRef.current?.click()}
                          className="w-full h-full md:w-16 md:h-16 bg-[#F5F5F5] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-105 transition-all"
                        >
                           {selectedLot.itemImage ? (
                             <img src={selectedLot.itemImage} className="w-full h-full object-cover" />
                           ) : (
                             <Camera size={20} className="text-[#111111]/20" />
                           )}
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#111111]/30">Design</p>
                           {selectedLot.itemImage && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); designInputRef.current?.click(); }}
                               className="p-1 hover:bg-[#F5F5F5] rounded-md transition-colors"
                             >
                               <Plus size={10} className="text-[#D4AF37]" />
                             </button>
                           )}
                        </div>
                    </div>
                    
                    <div className="bg-white border border-[#111111]/5 rounded-[2rem] p-4 flex flex-col items-center justify-center gap-2 shadow-premium group relative overflow-hidden aspect-square xl:aspect-auto xl:h-[calc(50%-8px)]">
                        <div 
                          onClick={() => selectedLot.sampleImage ? setPreviewImage(selectedLot.sampleImage) : sampleInputRef.current?.click()}
                          className="w-full h-full md:w-16 md:h-16 bg-[#F5F5F5] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-105 transition-all"
                        >
                           {selectedLot.sampleImage ? (
                             <img src={selectedLot.sampleImage} className="w-full h-full object-cover" />
                           ) : (
                             <Image size={20} className="text-[#111111]/20" />
                           )}
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#111111]/30">Sample</p>
                           {selectedLot.sampleImage && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); sampleInputRef.current?.click(); }}
                               className="p-1 hover:bg-[#F5F5F5] rounded-md transition-colors"
                             >
                               <Plus size={10} className="text-[#D4AF37]" />
                             </button>
                           )}
                        </div>
                    </div>
                  </div>
              </div>

              {/* Compact Size Management Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]/30">Quantity Matrix</h4>
                </div>
                
                <div className="grid grid-cols-3 md:flex md:flex-wrap gap-3">
                  {Object.entries(selectedLot.sizes).map(([size, qty]) => (
                    <div key={size} className="bg-white border border-[#111111]/5 p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center relative group transition-all hover:border-[#D4AF37]/30 min-h-[100px]">
                      <button 
                        onClick={() => {
                          if(confirm(`Remove size ${size}?`)) {
                            const newSizes = { ...selectedLot.sizes };
                            delete newSizes[size];
                            onUpdateLot(selectedLot.id, { sizes: newSizes });
                          }
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#F5F5F5] text-[#111111]/20 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                      
                      <div className="text-center space-y-2 mt-2">
                        <span className="text-[10px] font-black text-[#111111]/20 uppercase tracking-widest">{size}</span>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={qty}
                            onChange={(e) => {
                              const newSizes = { ...selectedLot.sizes, [size]: e.target.value };
                              onUpdateLot(selectedLot.id, { sizes: newSizes });
                            }}
                            className="w-full bg-transparent text-center text-lg font-display font-black text-[#111111] outline-none border-none p-0"
                            placeholder="0"
                          />
                          <div className="h-0.5 w-4 bg-[#D4AF37]/20 mx-auto mt-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Single Premium Add Button */}
                  {allAvailableSizes.filter(s => !selectedLot.sizes[s]).length > 0 && (
                    <button 
                      onClick={() => setIsExtendSizesOpen(true)}
                      className="bg-[#F5F5F5] border-2 border-dashed border-[#111111]/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37]/30 group transition-all min-h-[100px]"
                    >
                       <div className="w-8 h-8 rounded-full border border-[#111111]/5 flex items-center justify-center group-hover:bg-[#111111] transition-all">
                          <Plus size={16} className="text-[#111111]/20 group-hover:text-[#D4AF37]" />
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-[#111111]/20 group-hover:text-[#111111]">Add Size</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#111111]/40">Production Pipeline</h4>
                  <span className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-full">
                    {selectedLot.processes.filter(p => p.isDone).length} / {selectedLot.processes.length} Stages
                  </span>
                </div>
                
                {/* Responsive Grid Pipeline */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {selectedLot.processes.map((proc, idx) => (
                    <div 
                      key={proc.id} 
                      className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${proc.isDone ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-white border-[#111111]/5 shadow-premium'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-5">
                          <button 
                            onClick={() => onUpdateProcess(selectedLot.id, proc.id, { isDone: !proc.isDone })}
                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${proc.isDone ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-[#111111]/10 text-[#111111]/10 hover:border-[#111111]'}`}
                          >
                            {proc.isDone && <Check size={24} strokeWidth={4} />}
                          </button>
                          <div>
                            <h3 className="text-lg font-display font-black text-[#111111] leading-none">{proc.name}</h3>
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 ${proc.isDone ? 'text-green-700' : 'text-[#111111]/30'}`}>
                              {proc.isDone ? 'Validated' : 'Awaiting Input'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#F5F5F5] p-1.5 rounded-2xl">
                           <span className="text-[9px] font-black text-[#111111]/30 uppercase ml-2">Pcs</span>
                           <input 
                              type="number" 
                              value={proc.pieces || ''} 
                              onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { pieces: e.target.value })}
                              className="w-20 h-10 bg-white border-none rounded-xl text-center text-lg font-black outline-none transition-all focus:bg-[#111111] focus:text-[#D4AF37]"
                              placeholder="0"
                           />
                        </div>
                      </div>

                      {/* Expanded UI for specific stages */}
                      {(proc.id === 'screening' || proc.id === 'embroidery') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#111111]/5">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Reference ID</label>
                              <input 
                                type="text" 
                                value={proc.billNumber || ''} 
                                onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { billNumber: e.target.value })}
                                className="w-full h-12 bg-white border border-[#111111]/5 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-[#111111] transition-all"
                                placeholder="Ref / Bill #"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Observations</label>
                              <input 
                                type="text"
                                value={proc.notes || ''} 
                                onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { notes: e.target.value })}
                                className="w-full h-12 bg-white border border-[#111111]/5 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-[#111111] transition-all"
                                placeholder="Notes..."
                              />
                           </div>
                        </div>
                      )}

                      {(proc.id === 'diamond' || proc.id === 'button') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#111111]/5">
                           {proc.id === 'button' && (
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Hardware / Pc</label>
                                <input 
                                  type="number" 
                                  value={proc.numButtons || ''} 
                                  onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { numButtons: e.target.value })}
                                  className="w-full h-12 bg-white border border-[#111111]/5 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-[#111111] transition-all"
                                  placeholder="0"
                                />
                              </div>
                           )}
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest ml-1">Rate (₹)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/30 font-bold text-[10px]">₹</span>
                                <input 
                                  type="number" 
                                  value={proc.pricePerPc || ''} 
                                  onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { pricePerPc: e.target.value })}
                                  className="w-full h-12 bg-white border border-[#111111]/5 rounded-xl pl-8 pr-4 text-[11px] font-bold outline-none focus:border-[#111111] transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                           </div>
                        </div>
                      )}

                      {/* Loss Indicator */}
                      {idx > 0 && proc.pieces > 0 && proc.pieces < selectedLot.processes[idx-1].pieces && (
                        <div className="mt-4 flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100">
                           <AlertCircle size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Deficit: {selectedLot.processes[idx-1].pieces - proc.pieces} Items lost in transit</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                 <div className="relative group flex flex-col h-full min-h-[220px]">
                    <div className="flex-1 bg-white border border-[#111111]/5 rounded-[3rem] p-6 shadow-premium group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                       <div className="mb-4 ml-2 mt-2">
                         <span className="text-sm font-black uppercase tracking-[0.4em] text-[#111111]">Note</span>
                       </div>
                       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111111 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }} />
                       <textarea 
                         value={selectedLot.notes || ''}
                         onChange={(e) => onUpdateLot(selectedLot.id, { notes: e.target.value })}
                         className="relative z-10 w-full h-full bg-transparent text-[15px] font-bold text-[#111111] leading-relaxed outline-none resize-none placeholder:text-[#111111]/20"
                         placeholder="Document manufacturing observations, quality notes, or production anomalies..."
                       />
                    </div>
                 </div>

                 <div className="flex flex-col justify-end gap-4">
                    <button 
                      onClick={() => { 
                        if(confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE this production lot? This action cannot be undone and all associated production data for this lot will be lost.')) { 
                          onDeleteLot(selectedLot.id);
                          closeSheet();
                        }
                      }}
                      className="w-full py-5 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white rounded-full transition-all border-2 border-red-100"
                    >
                      Permanently Delete Lot
                    </button>
                    <button onClick={closeSheet} className="w-full bg-[#D4AF37] text-[#111111] py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-premium active:scale-95 transition-all">
                      Save & Close Log
                    </button>
                 </div>
              </div>
          </div>
        )}
      </BottomSheet>

      {/* Full Screen Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-[#111111] flex flex-col items-center justify-center p-6">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all z-10"
          >
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            className="max-w-full max-h-[80vh] object-contain rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300"
            alt="Preview"
          />
         </div>
      )}

      {/* Extend Sizes Sheet */}
      <BottomSheet 
        isOpen={isExtendSizesOpen} 
        onClose={() => { setIsExtendSizesOpen(false); setExtendSizes({}); }} 
        onBack={() => { setIsExtendSizesOpen(false); setExtendSizes({}); }}
        title="Extend Production Range"
        fullScreen
      >
        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]/30 ml-1">Select New Sizes</label>
            <div className="flex flex-wrap gap-2">
              {allAvailableSizes.filter(s => !Object.keys(selectedLot?.sizes || {}).includes(s) && extendSizes[s] === undefined).map(size => (
                <button 
                  key={size}
                  onClick={() => {
                    const newExt = { ...extendSizes };
                    if (newExt[size] !== undefined) delete newExt[size];
                    else newExt[size] = '';
                    setExtendSizes(newExt);
                  }}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${extendSizes[size] !== undefined ? 'bg-[#111111] text-[#D4AF37] shadow-lg scale-105' : 'bg-[#F5F5F5] text-[#111111]/30 hover:text-[#111111]'}`}
                >
                   {size}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(extendSizes).length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]/30 ml-1">Set Quantities</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(extendSizes).map(size => (
                  <div key={size} className="bg-white border border-[#111111]/5 p-3 rounded-2xl shadow-premium text-center flex flex-col items-center gap-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#111111]/20">{size}</p>
                    <div className="relative w-full">
                      <input 
                        type="number"
                        value={extendSizes[size]}
                        onChange={(e) => setExtendSizes({ ...extendSizes, [size]: e.target.value })}
                        className="w-full bg-transparent text-center text-lg font-display font-black text-[#111111] outline-none border-none p-0"
                        placeholder="0"
                      />
                      <div className="h-0.5 w-4 bg-[#D4AF37]/20 mx-auto mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={() => {
                const newSizes = { ...selectedLot.sizes, ...extendSizes };
                onUpdateLot(selectedLot.id, { sizes: newSizes });
                setIsExtendSizesOpen(false);
                setExtendSizes({});
              }}
              disabled={Object.keys(extendSizes).length === 0}
              className="w-full bg-[#111111] text-[#D4AF37] py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-premium active:scale-95 transition-all disabled:opacity-20"
            >
              Update Production Range
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
