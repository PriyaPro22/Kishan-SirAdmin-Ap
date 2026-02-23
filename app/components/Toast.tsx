'use client';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        },
      }}
    />
  );
}

// Toast utilities
export const showSuccess = (message: string) => {
  toast.custom((t) => (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  ), {
    duration: 2000,
  });
};

export const showError = (message: string) => {
  toast.custom((t) => (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <XCircle size={20} className="text-red-500 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  ), {
    duration: 3000,
  });
};

export const showInfo = (message: string) => {
  toast.custom((t) => (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <Info size={20} className="text-blue-500 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  ), {
    duration: 2000,
  });
};

export const showWarning = (message: string) => {
  toast.custom((t) => (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  ), {
    duration: 3000,
  });
};
