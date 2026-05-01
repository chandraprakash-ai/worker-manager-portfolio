import { motion, AnimatePresence } from 'framer-motion';

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-[2.5rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="w-full flex justify-center py-4">
              <div className="w-12 h-1.5 bg-surface-200 rounded-full" />
            </div>
            
            {title && (
              <div className="px-6 pb-4">
                <h2 className="text-2xl font-display font-bold text-brand">{title}</h2>
              </div>
            )}
            
            <div className="px-6 pb-10 overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
