import React from 'react';
import { motion } from 'framer-motion';

export const LoginPage = ({ username, setUsername, pin, setPin, handleLogin }) => {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">AMRUT FASHION</h1>
          <p className="text-surface-300 font-bold uppercase tracking-[0.3em] text-[10px]">Security Clearance Required</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium focus:ring-2 ring-[#D4AF37]/20 transition-all" 
            placeholder="Manager ID" 
          />
          <input 
            type="password" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)} 
            className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium focus:ring-2 ring-[#D4AF37]/20 transition-all" 
            placeholder="Security PIN" 
          />
          <button type="submit" className="w-full btn-primary py-5 text-lg shadow-premium">Authorize Session</button>
        </form>
      </motion.div>
    </div>
  );
};
