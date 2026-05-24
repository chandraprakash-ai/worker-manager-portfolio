import React, { useState, useRef } from 'react';
import * as fs from '../../lib/firebaseServices';

// Modular Components
import { LotInitializationSheet } from '../lots/modals/LotInitializationSheet';
import { LotDetailDashboard } from '../lots/modals/LotDetailDashboard';
import { LotMediaPreview } from '../lots/modals/LotMediaPreview';
import { LotAddSizesSheet } from '../lots/modals/LotAddSizesSheet';

export const LotModals = ({ 
  isAddLotOpen, closeSheet, handleAddLot, newLot, setNewLot, 
  isLotDetailOpen, isExtendSizesOpen, selectedLot, onUpdateProcess, onUpdateLot, onDeleteLot, onOpenSheet, onNavigate 
}) => {
  // Shared UI State
  const [previewData, setPreviewData] = useState(null);
  const [localError, setLocalError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({}); 
  const [previews, setPreviews] = useState({});

  const designInputRef = useRef(null);
  const sampleInputRef = useRef(null);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setPendingFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const validateAndSubmit = async (e, customData = null) => {
    if (e) e.preventDefault();
    if (isUploading) return;
    
    const sourceData = customData || selectedLot || newLot;
    
    // Cast sizes to Numbers for database integrity
    const sanitizedSizes = {};
    Object.entries(sourceData.sizes || {}).forEach(([size, qty]) => {
      sanitizedSizes[size] = Number(qty) || 0;
    });

    let finalLotData = { 
      ...sourceData,
      sizes: sanitizedSizes,
      numColors: Number(sourceData.numColors) || 1,
      avg: sourceData.avg !== undefined && sourceData.avg !== '' ? Number(sourceData.avg) : '',
      rate: sourceData.rate !== undefined && sourceData.rate !== '' ? Number(sourceData.rate) : ''
    };

    const activeSizes = Object.keys(finalLotData.sizes || {});

    // Validation for new lots
    if (!selectedLot) {
      if (activeSizes.length === 0) {
        setLocalError('Please select at least one size');
        return;
      }
      
      const missingQty = activeSizes.find(s => !sourceData.sizes[s] || Number(sourceData.sizes[s]) <= 0);
      if (missingQty) {
        setLocalError(`Please enter quantity for size ${missingQty}`);
        return;
      }
    }
    
    setIsUploading(true);
    setLocalError('');

    try {
      
      // Process pending uploads
      for (const [type, file] of Object.entries(pendingFiles)) {
        if (file) {
          const folder = type === 'itemImage' ? 'lots/designs' : 'lots/samples';
          const downloadUrl = await fs.uploadImage(file, folder);
          finalLotData[type] = downloadUrl;
        }
      }

      if (selectedLot) {
        await onUpdateLot(selectedLot.id, finalLotData);
      } else {
        await handleAddLot(e, finalLotData);
      }
      
      setPendingFiles({});
      setPreviews({});
    } catch (err) {
      setLocalError('Save failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <LotInitializationSheet 
        isOpen={isAddLotOpen}
        onClose={closeSheet}
        newLot={newLot}
        setNewLot={setNewLot}
        isUploading={isUploading}
        previews={previews}
        handleImageUpload={handleImageUpload}
        validateAndSubmit={validateAndSubmit}
        localError={localError}
      />

      <LotDetailDashboard 
        isOpen={isLotDetailOpen}
        onClose={closeSheet}
        selectedLot={selectedLot}
        onUpdateLot={onUpdateLot}
        onUpdateProcess={onUpdateProcess}
        onDeleteLot={onDeleteLot}
        onOpenSheet={onOpenSheet}
        setPreviewData={setPreviewData}
      />

      <LotMediaPreview 
        previewData={previewData}
        setPreviewData={setPreviewData}
        previews={previews}
        setPreviews={setPreviews}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onUpdateLot={onUpdateLot}
        selectedLot={selectedLot}
        designInputRef={designInputRef}
        sampleInputRef={sampleInputRef}
        fs={fs}
      />

      <LotAddSizesSheet 
        isOpen={isExtendSizesOpen}
        onClose={closeSheet}
        selectedLot={selectedLot}
        onUpdateLot={onUpdateLot}
      />

      {/* Hidden inputs for image selection across all modals */}
      <input type="file" ref={designInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'itemImage')} />
      <input type="file" ref={sampleInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sampleImage')} />
    </>
  );
};
