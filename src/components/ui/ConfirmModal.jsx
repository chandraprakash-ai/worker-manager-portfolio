import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { haptic } from '../../utils/haptics';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { haptic('light'); onCancel(); }}
          className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-premium overflow-hidden z-10"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <AlertTriangle size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-2xl font-display font-black text-[#111111] mb-2 leading-tight">{title}</h3>
            <p className="text-[#111111]/50 font-bold text-sm mb-8">{message}</p>
            <div className="flex gap-3">
              <Button variant="grey" fullWidth onClick={() => { haptic('light'); onCancel(); }}>
                {cancelText}
              </Button>
              <Button variant="danger" fullWidth onClick={() => { haptic('heavy'); onConfirm(); }}>
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
