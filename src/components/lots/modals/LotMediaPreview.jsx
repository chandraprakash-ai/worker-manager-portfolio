import React from 'react';
import { X, Pencil, Check, Loader2 } from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';

export const LotMediaPreview = ({
  previewData,
  setPreviewData,
  previews,
  setPreviews,
  pendingFiles,
  setPendingFiles,
  isUploading,
  setIsUploading,
  onUpdateLot,
  selectedLot,
  designInputRef,
  sampleInputRef,
  fs
}) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  if (!previewData) return null;

  const handleClose = () => {
    if (Object.keys(pendingFiles).length > 0) {
      setShowDiscardConfirm(true);
    } else {
      setPreviewData(null);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const file = pendingFiles[previewData.type];
      const folder = previewData.type === 'itemImage' ? 'lots/designs' : 'lots/samples';
      const downloadUrl = await fs.uploadImage(file, folder);
      await onUpdateLot(selectedLot.id, { [previewData.type]: downloadUrl });
      setPreviewData({ ...previewData, url: downloadUrl });
      setPreviews({});
      setPendingFiles({});
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#111111] flex flex-col items-center justify-center p-4 backdrop-blur-3xl animate-in fade-in duration-300">
      <button 
        onClick={handleClose} 
        className="absolute top-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 active:scale-90 rounded-2xl flex items-center justify-center text-white transition-all"
      >
        <X size={28} className="md:size-[32px]" />
      </button>
      
      <div className="flex flex-col items-center gap-10 w-full max-w-5xl">
        <div className="relative group max-h-[70vh] overflow-hidden rounded-[3rem] shadow-2xl border border-white/10">
          <img 
            src={previews[previewData.type] || previewData.url} 
            className="max-w-full max-h-[70vh] object-contain"
            alt="Preview"
          />
          {previews[previewData.type] && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
               <div className="px-6 py-3 bg-[#D4AF37] text-white rounded-full text-[10px] font-black uppercase">Pending Save</div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <button 
            onClick={() => (previewData.type === 'itemImage' ? designInputRef : sampleInputRef).current?.click()}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-[1.5rem] text-[10px] font-black uppercase"
          >
            <Pencil size={14} />
            {previews[previewData.type] ? 'Choose Different File' : 'Edit Photo'}
          </button>

          {previews[previewData.type] && (
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#D4AF37] text-white rounded-[1.5rem] text-xs font-black uppercase"
            >
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Confirm & Save to Cloud
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="Discard Changes"
        message="Are you sure you want to discard your unsaved image edits?"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setPreviewData(null);
          setPreviews({});
          setPendingFiles({});
        }}
        onCancel={() => setShowDiscardConfirm(false)}
        confirmText="Discard"
        cancelText="Keep Editing"
      />
    </div>
  );
};
