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
    haptic('light');
    // For main navigation, we use replace: true to prevent history stack bloat
    // this gives it a "Native App" feel where tabs don't create back-loops
    navigate(path, { replace: true });
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4 no-print">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between w-full max-w-[400px]"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className="relative flex-1 flex flex-col items-center justify-center h-16 transition-all group"
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute w-14 h-14 bg-[#D4AF37] rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <Icon 
                    size={20} 
                    className={`transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-white/40 group-hover:text-white/70'}`} 
                    strokeWidth={active ? 3 : 2}
                  />
                  <span className={`font-black mt-1.5 transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-white/20 group-hover:text-white/40'} ${isHindi ? 'text-[12px] tracking-normal' : 'text-[7px] uppercase tracking-widest'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
