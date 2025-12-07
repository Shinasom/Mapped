// frontend/src/components/map/Toast.tsx
'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ 
  message, 
  type = 'success', 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-olive-700 border-olive-900',
    error: 'bg-red-700 border-red-900',
    info: 'bg-stone-700 border-stone-900'
  };

  return (
    <div className="fixed top-20 right-4 z-[2001]">
      <div className={`${styles[type]} border-2 text-stone-50 px-5 py-3 shadow-xl font-medium text-sm`}>
        {message}
      </div>
    </div>
  );
}