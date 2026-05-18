import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { haptic } from '../../utils/haptics';

export const LoginPage = () => {
  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const authError = useAuthStore(state => state.error);
  const authLoading = useAuthStore(state => state.isLoading);
  const resetPassword = useAuthStore(state => state.resetPassword);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleGoogleSignIn = async () => {
    const success = await loginWithGoogle();
    if (success) {
      haptic('medium');
    } else {
      haptic('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) {
      haptic('error');
      return;
    }

    let success = false;
    if (isRegistering) {
      success = await register(username, pin, displayName);
    } else {
      success = await login(username, pin);
    }

    if (success) {
      haptic('medium');
    } else {
      haptic('error');
    }
  };

  const handleResetPassword = async () => {
    if (!username.trim()) {
      setResetError("Please enter your Manager ID to receive a reset link.");
      return;
    }
    setResetError('');
    const success = await resetPassword(username);
    if (success) {
      setResetSent(true);
      setTimeout(() => setResetSent(false), 8000);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">AMRUT FASHION</h1>
          <p className="text-[#111111]/40 font-bold uppercase tracking-[0.3em] text-[10px]">
            {isRegistering ? "Register New Manager" : "Security Clearance Required"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {authError && (
            <motion.div 
              key="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </motion.div>
          )}

          {resetError && (
            <motion.div 
              key="reset-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </motion.div>
          )}

          {resetSent && (
            <motion.div 
              key="reset-sent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <span>Reset link sent to registered email! Please check inbox/spam.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence initial={false}>
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[10px] uppercase font-bold text-[#111111]/40 tracking-wider mb-2 pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium focus:ring-2 ring-[#D4AF37]/20 transition-all text-[#111111]" 
                  placeholder="e.g. Rahul Verma" 
                  disabled={authLoading}
                  required={isRegistering}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#111111]/40 tracking-wider mb-2 pl-1">Manager ID / Email</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => {
                setUsername(e.target.value);
                if (resetError) setResetError('');
              }} 
              className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium focus:ring-2 ring-[#D4AF37]/20 transition-all text-[#111111]" 
              placeholder="e.g. admin" 
              disabled={authLoading}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#111111]/40 tracking-wider mb-2 pl-1">
              {isRegistering ? "Security PIN (min. 6 characters)" : "Security PIN"}
            </label>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full bg-[#F5F5F5] border-none rounded-2xl p-5 outline-none font-medium focus:ring-2 ring-[#D4AF37]/20 transition-all text-[#111111]" 
              placeholder="PIN code" 
              disabled={authLoading}
              required
            />
          </div>

          {!isRegistering && (
            <div className="flex justify-end px-1">
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-xs font-bold text-[#D4AF37] hover:underline"
                disabled={authLoading}
              >
                Forgot PIN / Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#111111] text-white hover:bg-[#222222] py-5 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={authLoading}
          >
            {authLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              isRegistering ? "Create Manager Account" : "Authorize Session"
            )}
          </button>

          {!isRegistering && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#111111]/10"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-[#111111]/30 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-[#111111]/10"></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full border-2 border-[#111111]/10 bg-white hover:bg-[#FAFAFA] text-[#111111] py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35 11.1H12V13.8H17.38C17.14 15.08 16.42 16.17 15.34 16.9V19.48H18.64C20.57 17.7 21.68 15.08 21.68 12.05C21.68 11.4 21.62 10.77 21.35 11.1Z" fill="#4285F4"/>
                  <path d="M12 20.6C14.58 20.6 16.74 19.75 18.33 18.28L15.34 15.7C14.43 16.31 13.26 16.68 12.31 16.68C9.98 16.68 8 15.11 7.29 13H3.5V15.66C5.07 18.79 8.31 20.95 12 20.6Z" fill="#34A853"/>
                  <path d="M6.98 12.98C6.8 12.44 6.7 11.87 6.7 11.28C6.7 10.69 6.8 10.12 6.98 9.58V6.92H3.5C2.88 8.16 2.53 9.56 2.53 11.04C2.53 12.52 2.88 13.92 3.5 15.16L6.98 12.98Z" fill="#FBBC05"/>
                  <path d="M12 6.02C13.4 6.02 14.66 6.5 15.65 7.45L18.39 4.71C16.73 3.16 14.58 2.2 12 2.2C8.31 2.2 5.07 4.36 3.5 7.49L6.98 10.19C7.69 8.08 9.67 6.51 12 6.02Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                useAuthStore.setState({ error: null });
              }}
              className="text-xs font-bold text-[#111111]/60 hover:text-[#111111] transition-colors"
              disabled={authLoading}
            >
              {isRegistering ? "Already have an account? Sign In" : "New Manager? Create security clearance"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
