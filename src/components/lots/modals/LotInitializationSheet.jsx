import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Image, Check, Tag, Loader2 } from 'lucide-react';
import { BottomSheet } from '../../ui/BottomSheet';
import { Button } from '../../ui/Button';

export const LotInitializationSheet = ({
  isOpen,
  onClose,
  newLot,
  setNewLot,
  isUploading,
  previews,
  handleImageUpload,
  validateAndSubmit,
  localError
}) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';
  const designInputRef = useRef(null);
  const sampleInputRef = useRef(null);
  const allAvailableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const activeSizes = Object.keys(newLot.sizes);

  const toggleSize = (size) => {
    const updatedSizes = { ...newLot.sizes };
    if (activeSizes.includes(size)) {
      delete updatedSizes[size];
    } else {
      updatedSizes[size] = '';
    }
    setNewLot({ ...newLot, sizes: updatedSizes });
  };

  const numColors = Number(newLot.numColors) || 1;
  const basePcs = Object.values(newLot.sizes).reduce((a, b) => Number(a) + Number(b), 0);
  const totalPcs = basePcs * numColors;

  useEffect(() => {
    if (isOpen && (!newLot.stages || newLot.stages.length === 0)) {
      const allStages = ['screening', 'embroidery', 'cutting', 'stitching', 'interlock', 'diamond', 'button', 'steampress', 'finishing'];
      const STAGE_NAMES = {
        screening: "Screening", embroidery: "Embroidery", cutting: "Cutting",
        stitching: "Stitching", interlock: "Interlock", diamond: "Diamond",
        button: "Button", steampress: "Steam Press", finishing: "Finishing"
      };
      
      const updatedProcesses = allStages.map(id => ({
        id,
        name: STAGE_NAMES[id],
        pieces: 0,
        isDone: false
      }));

      setNewLot(prev => ({ 
        ...prev, 
        stages: allStages,
        processes: updatedProcesses
      }));
    }
  }, [isOpen]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('lots.add_lot')}>
      <form onSubmit={validateAndSubmit} className="space-y-8 pb-10">
        <div className="space-y-6">
          {/* Brand Selection */}
          <div>
            <label className={`block font-black text-[#111111]/30 uppercase mb-3 ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.select_brand')}</label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-black text-[#111111]/30 uppercase mb-3 ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.lot_batch_id')}</label>
                  <input 
                    type="text" 
                    required 
                    value={newLot.lotNumber} 
                    onChange={(e) => setNewLot({ ...newLot, lotNumber: e.target.value })} 
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold text-lg uppercase" 
                    placeholder="AF-2024-01" 
                  />
                </div>
                <div>
                  <label className={`block font-black text-[#111111]/30 uppercase mb-3 ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.colors', 'Colors')}</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={newLot.numColors || 1} 
                    onChange={(e) => setNewLot({ ...newLot, numColors: Number(e.target.value) || 1 })} 
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-bold text-lg" 
                    placeholder="1" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className={`block font-black text-[#111111]/30 uppercase mb-1 ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.select_sizes')}</label>
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
              <input type="file" ref={designInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'itemImage')} />
              {isUploading && (
                <div className="absolute inset-0 z-[20] bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
                </div>
              )}
              {(previews.itemImage || newLot.itemImage) ? (
                <>
                  <img src={previews.itemImage || newLot.itemImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Check size={20} className="text-[#D4AF37]" />
                    </div>
                    <p className={`font-black text-white uppercase ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.update_design')}</p>
                  </div>
                </>
              ) : (
                <>
                  <Camera size={32} className="text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                  <p className={`font-black text-white/40 uppercase px-4 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.add_design')}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
             <label className={`block font-black text-[#111111]/30 uppercase ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.production_quantities')}</label>
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
             <label className={`block font-black text-[#111111]/30 uppercase ml-1 ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.production_workflow')}</label>
             <div className="grid grid-cols-2 gap-2">
               {[
                 { id: 'screening', name: 'Screening' },
                 { id: 'embroidery', name: 'Embroidery' },
                 { id: 'cutting', name: 'Cutting' },
                 { id: 'stitching', name: 'Stitching' },
                 { id: 'interlock', name: 'Interlock' },
                 { id: 'diamond', name: 'Diamond' },
                 { id: 'button', name: 'Button' },
                 { id: 'steampress', name: 'Steam Press' },
                 { id: 'finishing', name: 'Finishing' }
               ].map(stage => (
                 <button
                   key={stage.id}
                   type="button"
                    onClick={() => {
                      const STAGE_NAMES = {
                        screening: "Screening", embroidery: "Embroidery", cutting: "Cutting",
                        stitching: "Stitching", interlock: "Interlock", diamond: "Diamond",
                        button: "Button", steampress: "Steam Press", finishing: "Finishing"
                      };
                      const currentStages = newLot.stages || [];
                      const updatedStages = currentStages.includes(stage.id) 
                        ? currentStages.filter(id => id !== stage.id) 
                        : [...currentStages, stage.id];
                      
                      const updatedProcesses = updatedStages.map(id => ({
                        id,
                        name: STAGE_NAMES[id] || id.charAt(0).toUpperCase() + id.slice(1),
                        pieces: 0,
                        isDone: false
                      }));

                      setNewLot({ ...newLot, stages: updatedStages, processes: updatedProcesses });
                    }}
                   className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${newLot.stages.includes(stage.id) ? 'bg-[#111111] border-[#111111] text-[#D4AF37]' : 'bg-white border-[#F5F5F5] text-[#111111]/30'}`}
                 >
                   <div className={`w-2 h-2 rounded-full ${newLot.stages.includes(stage.id) ? 'bg-[#D4AF37]' : 'bg-[#111111]/10'}`} />
                   <span className={`font-black uppercase ${isHindi ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-widest'}`}>{t(`stages.${stage.id}`)}</span>
                 </button>
               ))}
             </div>
          </div>

          <div 
            onClick={() => sampleInputRef.current?.click()}
            className="bg-[#F5F5F5] min-h-[120px] p-6 rounded-[2.5rem] border-2 border-dashed border-surface-200 text-center flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden"
          >
            <input type="file" ref={sampleInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sampleImage')} />
            {(previews.sampleImage || newLot.sampleImage) ? (
              <>
                <img src={previews.sampleImage || newLot.sampleImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <p className={`relative z-10 font-black text-[#111111] uppercase ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.change_sample')}</p>
              </>
            ) : (
              <>
                <Image size={32} className="text-[#111111]/10 mb-2" />
                <p className={`font-black text-[#111111]/30 uppercase ${isHindi ? 'text-xs tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.attach_sample')}</p>
              </>
            )}
          </div>

          <div className="bg-[#111111] text-[#D4AF37] p-6 rounded-[2rem] shadow-premium">
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-black uppercase opacity-40 ${isHindi ? 'text-[11px] tracking-normal' : 'text-[10px] tracking-widest'}`}>{t('lots.planned_production')}</p>
                <h4 className="text-3xl font-display font-bold">{totalPcs} {t('lots.pcs')}</h4>
                {numColors > 1 && (
                  <p className="text-white/40 text-[10px] font-black uppercase mt-1 tracking-widest">
                    {numColors} {t('lots.colors', 'COLORS')} × {basePcs} {t('lots.pcs', 'PCS')}
                  </p>
                )}
              </div>
              <Tag size={24} />
            </div>
          </div>

          {localError && (
            <p className="text-center text-xs font-black text-red-500 uppercase tracking-widest animate-pulse">{localError}</p>
          )}
          <Button fullWidth variant="primary" size="lg" type="submit">{t('lots.init_cycle')}</Button>
        </div>
      </form>
    </BottomSheet>
  );
};
