import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, ClipboardList, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { haptic } from '../../utils/haptics';

export const FloatingNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'workers', label: 'Workers', icon: Users, path: '/workers' },
    { id: 'lots', label: 'Lots', icon: ClipboardList, path: '/lots' },
    { id: 'profile', label: 'System', icon: User, path: '/system' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path) => {
    haptic('light');
    navigate(path);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-6 no-print">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 md:gap-8"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className="relative flex flex-col items-center justify-center py-2 px-4 md:px-6 transition-all group"
            >
              {active && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#D4AF37] rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <Icon 
                  size={20} 
                  className={`transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-white/40 group-hover:text-white/70'}`} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 transition-colors duration-300 ${active ? 'text-[#111111]' : 'text-white/20 group-hover:text-white/40'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
