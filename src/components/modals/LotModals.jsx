import React, { useState, useRef } from 'react';
import { Plus, Check, ClipboardList, Camera, Image, Tag, IndianRupee, X, AlertCircle, Trash2, FileText } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

export const LotModals = ({ 
  isAddLotOpen, closeSheet, handleAddLot, newLot, setNewLot, 
  isLotDetailOpen, selectedLot, onUpdateProcess, onUpdateLot 
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const allAvailableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const activeSizes = Object.keys(newLot.sizes);
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
        <form onSubmit={handleAddLot} className="space-y-8 pb-10">
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
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-4">Capture / Upload Design</p>
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
          <button type="submit" className="w-full btn-primary py-5 shadow-premium">Initialize Production Cycle</button>
        </form>
      </BottomSheet>

      {/* Lot Detail Matrix Sheet */}
      <BottomSheet isOpen={isLotDetailOpen} onClose={closeSheet} title={`Production Dashboard`}>
        {selectedLot && (
          <div className="space-y-8 pb-10">
             <div className="bg-[#111111] text-white p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                {selectedLot.itemImage && (
                  <img src={selectedLot.itemImage} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
                )}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-display font-black mb-1 text-[#D4AF37]">
                      <span className="text-white/40 text-[10px] mr-2">{selectedLot.brand || 'KS4U'}</span>
                      Lot #{selectedLot.lotNumber}
                    </h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Initialized {new Date(selectedLot.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-display font-bold">{Object.values(selectedLot.sizes).reduce((a, b) => Number(a) + Number(b), 0)}</p>
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Total Pieces</p>
                  </div>
                </div>

                <div className="relative z-10 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {Object.entries(selectedLot.sizes).map(([size, qty]) => (
                    <div key={size} className="flex-shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-center min-w-[60px]">
                       <p className="text-[8px] font-black text-[#D4AF37] uppercase mb-0.5">{size}</p>
                       <p className="text-xs font-bold">{qty}</p>
                    </div>
                  ))}
                </div>
             </div>

              <div className="grid grid-cols-2 gap-4 px-1">
                <div 
                  onClick={() => selectedLot.itemImage && setPreviewImage(selectedLot.itemImage)}
                  className="aspect-square bg-[#F5F5F5] rounded-[2rem] border-2 border-surface-100 overflow-hidden relative group cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  {selectedLot.itemImage ? (
                    <img src={selectedLot.itemImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#111111]/20">
                      <Image size={24} />
                      <p className="text-[7px] font-black uppercase mt-1">No Design</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl text-[#111111] shadow-sm">
                    <Plus size={12} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#111111]/80 backdrop-blur-md text-[#D4AF37] px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest">Design Image</div>
                </div>

                <div 
                  onClick={() => selectedLot.sampleImage && setPreviewImage(selectedLot.sampleImage)}
                  className="aspect-square bg-[#F5F5F5] rounded-[2rem] border-2 border-surface-100 overflow-hidden relative group cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  {selectedLot.sampleImage ? (
                    <img src={selectedLot.sampleImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#111111]/20">
                      <Tag size={24} />
                      <p className="text-[7px] font-black uppercase mt-1">No Sample</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl text-[#111111] shadow-sm">
                    <Plus size={12} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#111111]/80 backdrop-blur-md text-[#D4AF37] px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest">Cloth Sample</div>
                </div>
              </div>

             <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-surface-300">Detailed Pipeline Analysis</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{selectedLot.processes.filter(p => p.isDone).length} / 8 Complete</span>
                </div>
                
                <div className="space-y-3">
                  {selectedLot.processes.map((proc, idx) => (
                    <div 
                      key={proc.id} 
                      className={`p-4 rounded-[2rem] border transition-all ${proc.isDone ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-surface-200 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => onUpdateProcess(selectedLot.id, proc.id, { isDone: !proc.isDone })}
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${proc.isDone ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-surface-300 text-surface-100 hover:border-[#111111]'}`}
                          >
                            {proc.isDone && <Check size={20} strokeWidth={4} />}
                          </button>
                          <div>
                            <h3 className="text-sm font-display font-bold text-[#111111] leading-tight">{proc.name}</h3>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${proc.isDone ? 'text-green-700' : 'text-[#111111]/50'}`}>
                              {proc.isDone ? 'COMPLETED' : 'PENDING'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <label className="text-[11px] font-black text-[#111111] uppercase tracking-widest whitespace-nowrap">Pcs</label>
                           <input 
                              type="number" 
                              value={proc.pieces || ''} 
                              onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { pieces: e.target.value })}
                              className="w-16 h-10 bg-white border-2 border-[#111111] rounded-xl text-center text-lg font-black outline-none transition-all focus:bg-[#111111] focus:text-[#D4AF37]"
                              placeholder="0"
                           />
                        </div>
                      </div>

                      {/* Dynamic Context Fields */}
                      {(proc.id === 'screening' || proc.id === 'embroidery') && (
                        <div className="space-y-4 mt-3 pt-4 border-t border-surface-100">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest ml-1">Bill Number</label>
                              <input 
                                type="text" 
                                value={proc.billNumber || ''} 
                                onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { billNumber: e.target.value })}
                                className="w-full h-12 bg-white border-2 border-surface-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#111111] transition-all"
                                placeholder="Reference / Bill #"
                              />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest ml-1">Stage Notes</label>
                              <textarea 
                                rows="3"
                                value={proc.notes || ''} 
                                onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { notes: e.target.value })}
                                className="w-full bg-white border-2 border-surface-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-[#111111] resize-none transition-all"
                                placeholder="Add detailed process notes here..."
                              />
                           </div>
                        </div>
                      )}

                      {(proc.id === 'diamond' || proc.id === 'button') && (
                        <div className="space-y-4 mt-3 pt-4 border-t border-surface-100">
                           {proc.id === 'button' && (
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest ml-1">Buttons / Piece</label>
                                <input 
                                  type="number" 
                                  value={proc.numButtons || ''} 
                                  onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { numButtons: e.target.value })}
                                  className="w-full h-12 bg-white border-2 border-surface-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#111111] transition-all"
                                  placeholder="0"
                                />
                              </div>
                           )}
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest ml-1">Price Per Piece</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/50 font-bold"><IndianRupee size={12} /></span>
                                <input 
                                  type="number" 
                                  value={proc.pricePerPc || ''} 
                                  onChange={(e) => onUpdateProcess(selectedLot.id, proc.id, { pricePerPc: e.target.value })}
                                  className="w-full h-12 bg-white border-2 border-surface-200 rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:border-[#111111] transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                           </div>
                        </div>
                      )}

                      {/* Loss Indicator */}
                      {idx > 0 && proc.pieces > 0 && proc.pieces < selectedLot.processes[idx-1].pieces && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                           <AlertCircle size={12} />
                           <span className="text-[8px] font-black uppercase tracking-widest">Mismatch: {selectedLot.processes[idx-1].pieces - proc.pieces} Missing</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-[#F5F5F5] p-6 rounded-[2.5rem] space-y-4 border border-surface-100">
                <div className="flex items-center gap-3 px-1">
                  <FileText size={18} className="text-[#111111]/30" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#111111]/60">General Lot Observation</h4>
                </div>
                <textarea 
                  rows="4"
                  value={selectedLot.notes || ''}
                  onChange={(e) => onUpdateLot(selectedLot.id, { notes: e.target.value })}
                  className="w-full bg-white border border-surface-200 rounded-[1.5rem] p-5 text-xs font-bold outline-none focus:border-[#111111] shadow-sm resize-none"
                  placeholder="Enter general remarks about this production cycle (fabric issues, delays, quality checks)..."
                />
             </div>

             <button onClick={closeSheet} className="w-full bg-[#111111] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all">Exit Production View</button>
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
          <div className="mt-8 text-center">
            <p className="text-[#D4AF37] font-display font-black text-2xl uppercase tracking-widest">Full Quality View</p>
            <p className="text-white/30 text-[10px] font-black uppercase mt-2">Design documentation verified</p>
          </div>
        </div>
      )}
    </>
  );
};
