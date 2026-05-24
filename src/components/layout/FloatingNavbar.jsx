import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, Users, ClipboardList, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { haptic } from '../../utils/haptics';
export const FloatingNavbar = () => {
  const { t, i18n: langContext } = useTranslation();
  const isHindi = langContext?.language === 'hi';
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: t('common.home'), icon: Home, path: '/' },
    { id: 'workers', label: t('common.workers'), icon: Users, path: '/workers' },
    { id: 'lots', label: t('common.lots'), icon: ClipboardList, path: '/lots' },
    { id: 'profile', label: t('common.system'), icon: User, path: '/system' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path) => {
    haptic('soft');
    // For main navigation, we use replace: true to prevent history stack bloat
    // this gives it a "Native App" feel where tabs don't create back-loops
    navigate(path, { replace: true });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-[100] bg-white border-t border-[#111111]/5 flex justify-center no-print h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <nav className="flex items-center justify-between w-full max-w-lg px-6 h-full">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className="relative flex-1 flex flex-col items-center justify-center h-full transition-all group"
            >
              {active && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute top-0 w-8 h-0.5 bg-[#D4AF37] rounded-full"
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                />
              )}
              
              <div className="flex flex-col items-center justify-center gap-1">
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-[#111111]/30 group-hover:text-[#111111]/60'}`} 
                  strokeWidth={active ? 3 : 2}
                />
                <span className={`font-black transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-[#111111]/30 group-hover:text-[#111111]/50'} ${isHindi ? 'text-[11px] tracking-normal' : 'text-[8px] uppercase tracking-widest'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
