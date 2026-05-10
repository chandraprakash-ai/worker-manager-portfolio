import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { haptic } from '../../utils/haptics';

export const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 120;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY > 0 || isRefreshingRef.current) return;
      startY.current = e.touches[0].pageY;
    };

    const handleTouchMove = (e) => {
      if (window.scrollY > 0 || isRefreshingRef.current) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        const resistance = 0.4;
        const distance = Math.min(diff * resistance, PULL_THRESHOLD + 40);
        setPullDistance(distance);
        pullDistanceRef.current = distance;
        
        if (diff > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isRefreshingRef.current) return;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        isRefreshingRef.current = true;
        haptic('medium');
        
        // Safety timeout to prevent stuck icon
        const timeoutId = setTimeout(() => {
          if (isRefreshingRef.current) {
            setIsRefreshing(false);
            isRefreshingRef.current = false;
            setPullDistance(0);
            pullDistanceRef.current = 0;
          }
        }, 10000);

        try {
          await onRefresh();
          haptic('success');
        } catch (err) {
          console.error("Refresh failed:", err);
        } finally {
          clearTimeout(timeoutId);
          setIsRefreshing(false);
          isRefreshingRef.current = false;
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative w-full">
      <div 
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-[60]"
        style={{ top: -60, height: 60 }}
      >
        <motion.div 
          animate={isRefreshing ? { rotate: 360, y: 80, opacity: 1, scale: 1 } : { 
            scale: progress, 
            opacity: progress,
            y: pullDistance,
            rotate: pullDistance * 2
          }}
          transition={isRefreshing ? { 
            rotate: { repeat: Infinity, duration: 1, ease: "linear" },
            y: { type: 'spring', damping: 15 }
          } : { type: 'tween', ease: "easeOut", duration: 0.1 }}
          className="w-12 h-12 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-white border border-[#111111]/5 flex items-center justify-center text-[#D4AF37]"
        >
          <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </motion.div>
      </div>

      <motion.div
        animate={{ y: isRefreshing ? 80 : pullDistance }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
