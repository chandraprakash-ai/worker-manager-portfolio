import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Cloud, Check, Loader2, ShieldCheck, Database, FileJson, History, LogOut, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCloudBackup, migrateLegacyData } from '../../lib/firebaseServices';
import { haptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';

export const BackupModal = ({ 
  onLogout,
  allData 
}) => {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const currentLanguage = i18n.language || 'en';

  const hasLegacyData = 
    allData?.lots?.some(item => !item.userId) ||
    allData?.workers?.some(item => !item.userId) ||
    allData?.inventory?.some(item => !item.userId);

  const handleMigration = async () => {
    if (!window.confirm("Permanently associate all ownerless legacy records with your current account? Run this only on your main production account.")) {
      return;
    }
    setIsMigrating(true);
    haptic('heavy');
    try {
      await migrateLegacyData();
      haptic('success');
      alert("Workspace claimed successfully! The app will now reload.");
      window.location.reload();
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Claim failed: " + err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const changeLanguage = (lng) => {
    haptic('medium');
    i18n.changeLanguage(lng);
  };

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
    <div className="pb-24 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col mb-8 gap-2">
        <h2 className={`text-3xl text-[#111111] font-display font-black tracking-tight leading-none ${i18n.language === 'hi' ? 'mt-1' : ''}`}>{t('system.title')}</h2>
      </div>

      <div className="space-y-10">
        
        {/* Language Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Globe size={14} className="text-[#111111]/30" />
            <span className={`font-black text-[#111111]/40 ${i18n.language === 'hi' ? 'text-[14px] tracking-normal' : 'text-[10px] uppercase tracking-widest'}`}>{t('system.language')}</span>
          </div>
          <div className="flex p-1 bg-[#F5F5F5] rounded-3xl border border-[#111111]/5">
            <button 
              onClick={() => changeLanguage('en')}
              className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all ${currentLanguage.startsWith('en') ? 'bg-green-500 shadow-sm text-white' : 'text-[#111111]/30 hover:text-[#111111]/60'} ${i18n.language === 'hi' ? 'text-[15px] tracking-normal' : 'text-[11px] uppercase tracking-widest'}`}
            >
              English
            </button>
            <button 
              onClick={() => changeLanguage('hi')}
              className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all ${currentLanguage.startsWith('hi') ? 'bg-green-500 shadow-sm text-white' : 'text-[#111111]/30 hover:text-[#111111]/60'} ${i18n.language === 'hi' ? 'text-[15px] tracking-normal' : 'text-[11px] uppercase tracking-widest'}`}
            >
              हिन्दी
            </button>
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
                <h4 className="text-xl font-display font-black text-[#111111]">{t('system.manual_export')}</h4>
                <p className={`font-black text-[#111111]/30 mt-1 ${i18n.language === 'hi' ? 'text-[14px] tracking-normal' : 'text-[10px] uppercase tracking-widest'}`}>Download JSON File</p>
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
                <h4 className="text-xl font-display font-black text-[#111111]">{t('system.cloud_snapshot')}</h4>
                <p className={`font-black text-[#111111]/30 mt-1 ${i18n.language === 'hi' ? 'text-[14px] tracking-normal' : 'text-[10px] uppercase tracking-widest'}`}>Internal Safety Restore Point</p>
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
              <span className={`font-black text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[14px] tracking-normal' : 'text-[9px] uppercase tracking-widest'}`}>Current Snapshot Metrics</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[15px] font-display font-black">{allData?.lots?.length || 0}</span>
                <span className={`font-black text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[12px] tracking-normal' : 'text-[8px] uppercase tracking-widest'}`}>{t('lots.active')} {t('common.lots')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-display font-black">{allData?.workers?.length || 0}</span>
                <span className={`font-black text-[#111111]/30 ${i18n.language === 'hi' ? 'text-[12px] tracking-normal' : 'text-[8px] uppercase tracking-widest'}`}>Personnel Records</span>
              </div>
           </div>
           
           <div className="mt-6 pt-4 border-t border-[#111111]/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className={`font-black text-[#111111]/40 ${i18n.language === 'hi' ? 'text-[12px] tracking-normal' : 'text-[8px] uppercase tracking-widest'}`}>{t('system.auto_sync_active')}</span>
              </div>
              <Check size={12} className="text-green-500" />
           </div>
        </div>

        {/* Claim Legacy Data Button */}
        {hasLegacyData && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleMigration}
            disabled={isMigrating}
            className="w-full border-2 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 py-5 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 text-base shadow-sm"
          >
            {isMigrating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            Claim Legacy Workspace Data
          </motion.button>
        )}

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptic('medium');
            onLogout();
          }}
          className="w-full border-2 border-red-500/10 bg-red-50/50 hover:bg-red-50 text-red-500 py-5 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 text-base shadow-sm"
        >
          <LogOut size={18} />
          {t('system.logout')}
        </motion.button>

      </div>
    </div>
  );
};
