import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative group w-full">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111111]/20 transition-colors group-focus-within:text-[#D4AF37]" size={20} />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-white border border-[#111111]/5 rounded-2xl py-4 pl-14 pr-6 shadow-sm focus:border-[#D4AF37]/30 outline-none transition-all font-medium text-sm" 
      />
    </div>
  );
};
