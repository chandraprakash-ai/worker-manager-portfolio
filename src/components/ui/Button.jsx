import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon,
  fullWidth = false,
  size = 'md',
  type = 'button',
  ...props
}) => {
  const { i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';

  const baseStyles = `relative font-black uppercase ${isHindi ? 'tracking-normal text-[1.1em]' : 'tracking-[0.15em]'} transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group`;
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-premium",
    secondary: "bg-[#111111] text-[#D4AF37] hover:bg-[#222222] shadow-premium border border-[#D4AF37]/10",
    outline: "bg-transparent border-2 border-[#111111]/10 text-[#111111]/40 hover:border-[#111111] hover:text-[#111111]",
    dashed: "bg-transparent border-2 border-dashed border-[#111111]/10 text-[#111111]/30 hover:bg-[#111111]/5 hover:text-[#111111]",
    grey: "bg-[#F5F5F5] text-[#111111]/60 hover:bg-[#E5E5E5] hover:text-[#111111]",
    danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100",
    ghost: "bg-transparent text-[#111111]/40 hover:text-[#111111] hover:bg-[#F5F5F5]"
  };

  const sizes = {
    sm: "px-4 py-2.5 text-[10px] rounded-xl",
    md: "px-6 py-4 text-xs rounded-2xl",
    lg: "px-8 py-6 text-sm rounded-[1.5rem] md:rounded-[2rem]"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </motion.button>
  );
};
