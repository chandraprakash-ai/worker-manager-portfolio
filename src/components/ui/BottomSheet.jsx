import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BottomSheet = ({ isOpen, onClose, title, children, fullScreen, showHandle = true, onBack, headerExtra }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Only for non-fullscreen */}
          {!fullScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
          )}
          
          {/* Sheet/Page */}
          <motion.div
            initial={fullScreen ? { opacity: 1, x: '100%' } : { y: '100%', opacity: 0 }}
            animate={fullScreen ? { x: 0 } : { y: 0, opacity: 1 }}
            exit={fullScreen ? { x: '100%' } : { y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={`fixed z-[100] bg-white flex flex-col
              ${fullScreen 
                ? 'inset-0 h-full w-full' 
                : 'inset-x-0 bottom-0 md:inset-0 md:m-auto h-fit max-h-[92vh] md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[3rem] w-full md:w-[90vw] md:max-w-[700px] shadow-2xl overflow-hidden'
              }`}
          >
            {/* Desktop Close Button - Only for non-fullscreen */}
            {!fullScreen && (
              <button 
                onClick={onClose}
                className="hidden md:flex absolute top-6 right-6 w-10 h-10 items-center justify-center rounded-full bg-surface-50 text-surface-400 hover:bg-[#111111] hover:text-[#D4AF37] transition-all z-[80]"
              >
                <svg size={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {/* Handle - Mobile Only, non-fullscreen */}
            {showHandle && !fullScreen && (
              <div className="w-full flex justify-center py-4 md:hidden">
                <div className="w-12 h-1.5 bg-surface-200 rounded-full" />
              </div>
            )}
            
            {title && (
              <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${fullScreen ? 'bg-white sticky top-0 z-[110] px-6 py-6 md:px-16 lg:px-32' : 'px-6 pt-8 pb-4 md:px-12'}`}>
                <div className="flex items-center gap-4">
                  {onBack && (
                    <button onClick={onBack} className="text-[#111111]/40 hover:text-[#111111] transition-all active:scale-90">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  )}
                  <div className="flex flex-col">
                    <h2 className="text-xl md:text-3xl font-display font-black text-[#111111] tracking-tight leading-none">{title}</h2>
                  </div>
                </div>
                {headerExtra && (
                  <div className="flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    {headerExtra}
                  </div>
                )}
              </div>
            )}
            
            <div className={`flex-1 overflow-y-auto no-scrollbar ${fullScreen ? 'px-6 md:px-16 lg:px-32 py-10' : 'px-6 pb-12 md:px-12 md:pb-20'}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
