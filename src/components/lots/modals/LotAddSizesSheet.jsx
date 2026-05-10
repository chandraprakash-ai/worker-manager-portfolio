import React, { useState } from 'react';
import { BottomSheet } from '../../ui/BottomSheet';
import { Button } from '../../ui/Button';

export const LotAddSizesSheet = ({
  isOpen,
  onClose,
  selectedLot,
  onUpdateLot
}) => {
  const [extendSizes, setExtendSizes] = useState({});
  const [error, setError] = useState('');
  const allAvailableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  if (!selectedLot) return null;

  const handleAdd = () => {
    const selectedKeys = Object.keys(extendSizes);
    
    if (selectedKeys.length === 0) {
      setError('Please select at least one new size');
      return;
    }

    const invalidSize = selectedKeys.find(s => !extendSizes[s] || Number(extendSizes[s]) <= 0);
    if (invalidSize) {
      setError(`Please enter a valid quantity for size ${invalidSize}`);
      return;
    }

    const newSizes = { ...selectedLot.sizes };
    Object.entries(extendSizes).forEach(([size, qty]) => {
      newSizes[size] = Number(qty);
    });

    onUpdateLot(selectedLot.id, { sizes: newSizes });
    setExtendSizes({});
    setError('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} onBack={onClose} title="Add Sizes" fullScreen>
      <div className="space-y-8 pb-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-[#111111]/30 ml-1">Select New Sizes</label>
          <div className="flex flex-wrap gap-2">
            {allAvailableSizes.filter(s => !selectedLot.sizes[s]).map(size => (
              <button 
                key={size}
                onClick={() => {
                  setError('');
                  setExtendSizes(prev => {
                    const next = { ...prev };
                    if (next[size] !== undefined) delete next[size];
                    else next[size] = '';
                    return next;
                  });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${extendSizes[size] !== undefined ? 'bg-[#111111] text-[#D4AF37]' : 'bg-[#F5F5F5] text-[#111111]/20'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(extendSizes).map(([size, qty]) => (
            <div key={size} className="bg-white border border-[#111111]/5 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-[#111111]/40 mb-2">{size}</p>
              <input 
                type="number" 
                value={qty}
                onChange={(e) => {
                  setError('');
                  setExtendSizes(prev => ({ ...prev, [size]: e.target.value }));
                }}
                className="w-full bg-[#F5F5F5] rounded-xl p-3 font-bold outline-none"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">{error}</p>
        )}

        <Button fullWidth variant="primary" size="lg" onClick={handleAdd}>Confirm Additions</Button>
      </div>
    </BottomSheet>
  );
};
