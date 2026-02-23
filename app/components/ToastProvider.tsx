'use client';
import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TOAST ====================
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
    showConfirm: () => { }
});

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
};

const colorMap: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', text: 'text-green-800' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', text: 'text-red-800' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', text: 'text-blue-800' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-800' }
};

const darkColorMap: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: 'bg-green-900/40', border: 'border-green-700', icon: 'text-green-400', text: 'text-green-200' },
    error: { bg: 'bg-red-900/40', border: 'border-red-700', icon: 'text-red-400', text: 'text-red-200' },
    info: { bg: 'bg-blue-900/40', border: 'border-blue-700', icon: 'text-blue-400', text: 'text-blue-200' },
    warning: { bg: 'bg-yellow-900/40', border: 'border-yellow-700', icon: 'text-yellow-400', text: 'text-yellow-200' }
};

// ==================== CONFIRM DIALOG ====================
interface ConfirmState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

export function ToastProvider({ children, darkMode = false }: { children: React.ReactNode; darkMode?: boolean }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    let counter = 0;

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now() + (counter++);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss after 3s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, title, message, onConfirm });
    }, []);

    const handleConfirmYes = () => {
        confirmDialog.onConfirm();
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    };

    const handleConfirmNo = () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    };

    const cMap = darkMode ? darkColorMap : colorMap;

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* ===== TOAST NOTIFICATIONS ===== */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2 w-[90vw] max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const c = cMap[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className={`pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-sm ${c.bg} ${c.border}`}
                            >
                                <span className={`material-symbols-outlined text-xl ${c.icon}`}>
                                    {iconMap[toast.type]}
                                </span>
                                <p className={`text-sm font-semibold flex-1 ${c.text}`}>
                                    {toast.message}
                                </p>
                                <button
                                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                    className={`${c.icon} opacity-60 hover:opacity-100 transition`}
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ===== CONFIRM DIALOG ===== */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <div className="fixed inset-0 z-[99998] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={handleConfirmNo}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            className={`relative z-10 w-[85vw] max-w-xs rounded-3xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            {/* Icon */}
                            <div className="flex justify-center pt-7 pb-2">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${confirmDialog.title.includes('Delete') ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    <span className={`material-symbols-outlined text-3xl ${confirmDialog.title.includes('Delete') ? 'text-red-500' : 'text-yellow-600'}`}>
                                        {confirmDialog.title.includes('Delete') ? 'delete_forever' : 'help_outline'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-2 text-center">
                                <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {confirmDialog.title}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {confirmDialog.message}
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 px-6 py-5">
                                <button
                                    onClick={handleConfirmNo}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${darkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmYes}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg ${confirmDialog.title.includes('Delete')
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                            : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-black'
                                        }`}
                                >
                                    {confirmDialog.title.includes('Delete') ? 'Delete' : 'Yes, Remove'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
}
