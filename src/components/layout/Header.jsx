import React from 'react';
import { LogOut } from 'lucide-react';

export const Header = ({ onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#111111] text-[#D4AF37] rounded-xl flex items-center justify-center font-black text-lg border border-[#D4AF37]/20 shadow-sm">A</div>
        <div>
          <h1 className="text-sm font-display font-black text-[#111111] tracking-tight">AMRUT FASHION</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] text-[#111111]/40 font-black uppercase tracking-tighter">Live Session</span>
          </div>
        </div>
      </div>
      <button onClick={onLogout} className="w-9 h-9 bg-surface-50 rounded-xl text-[#111111]/40 flex items-center justify-center active:scale-90 transition-all border border-surface-100"><LogOut size={16} /></button>
    </header>
  );
};
