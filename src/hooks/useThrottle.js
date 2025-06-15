// src/hooks/useThrottle.js
import { useCallback, useRef } from 'react';

const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      // اجرای فوری اگر زمان کافی گذشته
      callback(...args);
      lastRun.current = now;
    } else {
      // اجرای تاخیری اگر زمان کافی نگذشته
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]);
};

export default useThrottle;