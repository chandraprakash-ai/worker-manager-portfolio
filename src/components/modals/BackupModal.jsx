import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Cloud, Check, Loader2, ShieldCheck, Database, FileJson, History, LogOut } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { createCloudBackup } from '../../lib/firebaseServices';
import { haptic } from '../../utils/haptics';

export const BackupModal = ({ 
  isOpen, 
  closeSheet, 
  onLogout,
  allData 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const handleDownload = () => {
    setIsExporting(true);
    haptic('medium');
    
    try {
      const dataStr = JSON.stringify(allData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `amrut_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setLastAction('download');
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloudSnapshot = async () => {
    setIsSnapshotting(true);
    haptic('heavy');
    
    try {
      await createCloudBackup(allData);
      setLastAction('snapshot');
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      console.error("Snapshot failed:", err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={closeSheet} title="System & Profile">
      <div className="p-8 space-y-10">
        {/* Security Intro */}
        <div className="flex items-center gap-5 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-blue-900 leading-none mb-1">Data Fortress</h3>
            <p className="text-[10px] font-bold text-blue-800/50 uppercase tracking-widest">Secure Backup Management</p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* JSON Export */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between group ${lastAction === 'download' ? 'bg-green-50 border-green-200' : 'bg-white border-[#111111]/5 shadow-premium hover:border-blue-500/30'}`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${lastAction === 'download' ? 'bg-green-500 text-white' : 'bg-[#F5F5F5] text-[#111111] group-hover:bg-blue-500 group-hover:text-white'}`}>
                {isExporting ? <Loader2 size={24} className="animate-spin" /> : lastAction === 'download' ? <Check size={24} /> : <FileJson size={24} />}
              </div>
              <div>
                <h4 className="text-xl font-display font-black text-[#111111]">Manual Export</h4>
                <p className="text-[10px] font-black uppercase text-[#111111]/30 tracking-widest mt-1">Download JSON File</p>
              </div>
            </div>
            <Download size={18} className="opacity-10 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Cloud Snapshot */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={handleCloudSnapshot}
            className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between group ${lastAction === 'snapshot' ? 'bg-green-50 border-green-200' : 'bg-white border-[#111111]/5 shadow-premium hover:border-blue-500/30'}`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${lastAction === 'snapshot' ? 'bg-green-500 text-white' : 'bg-[#F5F5F5] text-[#111111] group-hover:bg-blue-500 group-hover:text-white'}`}>
                {isSnapshotting ? <Loader2 size={24} className="animate-spin" /> : lastAction === 'snapshot' ? <Check size={24} /> : <Cloud size={24} />}
              </div>
              <div>
                <h4 className="text-xl font-display font-black text-[#111111]">Cloud Snapshot</h4>
                <p className="text-[10px] font-black uppercase text-[#111111]/30 tracking-widest mt-1">Internal Safety Restore Point</p>
              </div>
            </div>
            <History size={18} className="opacity-10 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        {/* Data Stats */}
        <div className="p-6 bg-[#FAFAFA] rounded-[2rem] border border-[#111111]/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <ShieldCheck size={60} />
           </div>
           <div className="flex items-center gap-3 mb-4">
              <Database size={14} className="text-[#111111]/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#111111]/30">Current Snapshot Metrics</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[15px] font-display font-black">{allData?.lots?.length || 0}</span>
                <span className="text-[8px] font-black uppercase text-[#111111]/30 tracking-widest">Active Lots</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-display font-black">{allData?.workers?.length || 0}</span>
                <span className="text-[8px] font-black uppercase text-[#111111]/30 tracking-widest">Personnel Records</span>
              </div>
           </div>
           
           <div className="mt-6 pt-4 border-t border-[#111111]/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-black uppercase text-[#111111]/40 tracking-widest">24h Automated Sync: Active</span>
              </div>
              <Check size={12} className="text-green-500" />
           </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-[#111111]/5">
          <Button 
            variant="danger" 
            className="w-full flex items-center justify-center gap-3 py-6"
            onClick={() => {
              haptic('heavy');
              onLogout();
            }}
          >
            <LogOut size={18} />
            Log Out from Session
          </Button>
          <Button variant="outline" className="w-full" onClick={closeSheet}>Back to Dashboard</Button>
        </div>
      </div>
    </BottomSheet>
  );
};
